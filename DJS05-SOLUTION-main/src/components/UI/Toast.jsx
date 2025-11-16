import styles from "./Toast.module.css";
import { useToast } from "../../context/ToastContext";

export default function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <span>{toast.message}</span>

      {toast.undo && (
        <button className={styles.undo} onClick={toast.undo}>
          Undo
        </button>
      )}

      <button className={styles.close} onClick={hideToast}>
        ✖
      </button>
    </div>
  );
}
