import { useEffect, useRef, useState } from 'react';
import styles from './FeedbackDialog.module.css';

export interface FeedbackData {
  title: string;
  description: string;
  attachments: File[];
}

interface FeedbackDialogProps {
  onClose: () => void;
  onSubmit: (data: FeedbackData) => void;
}

export default function FeedbackDialog({ onClose, onSubmit }: FeedbackDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [onClose]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      setAttachments(Array.from(e.target.files));
    }
  }

  function handleSubmit() {
    onSubmit({ title, description, attachments });
  }

  return (
    <div className={styles.overlay} onClick={onClose} ref={overlayRef}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Send Feedback</h2>
        </div>
        <div className={styles.body}>
          <label htmlFor="feedback-title">Title</label>
          <input
            id="feedback-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your feedback"
          />
          <label htmlFor="feedback-description">Description</label>
          <textarea
            id="feedback-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell us more..."
          />
          <label>Attachment (optional)</label>
          <label className={styles.fileUpload}>
            <input type="file" onChange={handleFileSelected} />
            <span className={styles.fileBtn}>Choose File</span>
            <span className={styles.fileName}>
              {attachments.length ? attachments[0].name : 'No file chosen'}
            </span>
          </label>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.cancel}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.submit}`}
            disabled={!title.trim()}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
