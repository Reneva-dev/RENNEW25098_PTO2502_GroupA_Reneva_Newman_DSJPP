import styles from "./Toast.module.css";
import { useToast } from "../../context/ToastContext";

/**
 * Toast notification component.
 *
 * Displays temporary feedback messages such as:
 * - Success alerts
 * - Error alerts
 * - Undo actions (optional)
 *
 * The ToastContext handles:
 * - Showing a toast
 * - Hiding a toast
 * - Managing the message, type, and undo callback
 *
 * This component simply renders the toast UI when a toast exists.
 *
 * @component
 */

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
