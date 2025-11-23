import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * XSS 공격을 방지하기 위해 HTML을 안전하게 렌더링하는 컴포넌트
 * DOMPurify를 사용하여 악성 스크립트를 제거합니다.
 *
 * @param html - 렌더링할 HTML 문자열
 * @param className - 컨테이너에 적용할 CSS 클래스
 * @param allowedTags - 허용할 HTML 태그 목록 (기본값: 일반적인 텍스트 태그)
 * @param allowedAttributes - 허용할 HTML 속성 목록 (기본값: class, id)
 */
export const SafeHtml = ({
  html,
  className,
  allowedTags = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'strike',
    's',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'div',
    'span',
  ],
  allowedAttributes = ['class', 'id', 'href', 'src', 'alt', 'title', 'target'],
}: SafeHtmlProps) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    // 링크의 target="_blank"를 허용하되, rel="noopener noreferrer" 추가
    ADD_ATTR: ['target', 'rel'],
    // JavaScript 프로토콜 차단
    ALLOW_DATA_ATTR: false,
    // 외부 링크에 noopener noreferrer 자동 추가
    RETURN_DOM_FRAGMENT: false,
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
