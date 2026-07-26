// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>404 - Not Found</h2>
      <p style={styles.text}>Could not find the requested resource.</p>
      <Link href="/" style={styles.button}>
        Return Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    fontFamily: 'sans-serif',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
};
