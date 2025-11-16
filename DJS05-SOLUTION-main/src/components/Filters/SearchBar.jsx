import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      name="search"
      placeholder="Search podcasts..."
      className={styles.search}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

