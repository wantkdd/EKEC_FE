/**
 * 환경별 로깅 유틸리티
 *
 * 개발 환경에서는 콘솔에 로그를 출력하고,
 * 프로덕션 환경에서는 중요한 에러만 외부 서비스(Sentry 등)로 전송합니다.
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * 로그 레벨
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 로그 메타데이터
 */
export interface LogMeta {
  [key: string]: unknown;
}

/**
 * 로그 포맷터
 */
const formatLog = (level: string, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * 프로덕션 환경에서 외부 로깅 서비스로 전송
 * TODO: Sentry, LogRocket 등의 서비스 연동
 */
const sendToExternalService = (
  _level: LogLevel,
  _message: string,
  _meta?: LogMeta
) => {
  // 추후 Sentry 등으로 전송
  // if (window.Sentry) {
  //   window.Sentry.captureMessage(message, {
  //     level: level === LogLevel.ERROR ? 'error' : 'warning',
  //     extra: meta,
  //   });
  // }
};

/**
 * 로거 클래스
 */
class Logger {
  private minLevel: LogLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

  /**
   * DEBUG 레벨 로그 (개발 환경에서만)
   */
  debug(...args: unknown[]) {
    if (this.minLevel <= LogLevel.DEBUG && isDev) {
      console.debug(formatLog("DEBUG", ...args));
    }
  }

  /**
   * INFO 레벨 로그 (개발 환경에서만)
   */
  info(...args: unknown[]) {
    if (this.minLevel <= LogLevel.INFO && isDev) {
      console.info(formatLog("INFO", ...args));
    }
  }

  /**
   * WARN 레벨 로그
   */
  warn(...args: unknown[]) {
    if (this.minLevel <= LogLevel.WARN) {
      if (isDev) {
        console.warn(formatLog("WARN", ...args));
      }
      if (isProd) {
        sendToExternalService(LogLevel.WARN, args.join(' '));
      }
    }
  }

  /**
   * ERROR 레벨 로그
   */
  error(...args: unknown[]) {
    if (this.minLevel <= LogLevel.ERROR) {
      if (isDev) {
        console.error(formatLog("ERROR", ...args));
      }

      if (isProd) {
        sendToExternalService(LogLevel.ERROR, args.join(' '));
      }
    }
  }

  /**
   * API 요청 로그
   */
  api(method: string, url: string, status?: number, meta?: LogMeta) {
    if (isDev) {
      const statusEmoji = status
        ? status < 300
          ? "✅"
          : status < 400
          ? "🔄"
          : status < 500
          ? "⚠️"
          : "🔴"
        : "📤";

      this.debug(`${statusEmoji} API ${method} ${url}`, {
        status,
        ...meta,
      });
    }
  }

  /**
   * 성능 측정 시작
   */
  timeStart(label: string) {
    if (isDev && console.time) {
      console.time(label);
    }
  }

  /**
   * 성능 측정 종료
   */
  timeEnd(label: string) {
    if (isDev && console.timeEnd) {
      console.timeEnd(label);
    }
  }

  /**
   * 그룹 시작
   */
  groupStart(label: string) {
    if (isDev && console.group) {
      console.group(label);
    }
  }

  /**
   * 그룹 종료
   */
  groupEnd() {
    if (isDev && console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * 테이블 형식으로 출력
   */
  table(data: unknown) {
    if (isDev && console.table) {
      console.table(data);
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 기본 내보내기
export default logger;
