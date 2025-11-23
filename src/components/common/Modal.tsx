type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
  padding?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
};

const Modal = ({
  children,
  onClose,
  maxWidth = "max-w-[560px]",
  padding = "p-8",
  ariaLabelledBy,
  ariaDescribedBy,
}: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
    {/* 백드롭 */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={onClose}
      aria-hidden="true"
    />
    {/* 모달 컨테이너 */}
    <div
      className={`relative w-full ${maxWidth} bg-white rounded-2xl ${padding}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  </div>
);

export default Modal;
