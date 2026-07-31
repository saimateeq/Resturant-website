export default function Loader({ fullScreen = true }) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-[60vh] w-full items-center justify-center'
          : 'flex w-full items-center justify-center py-8'
      }
      role="status"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
    </div>
  );
}
