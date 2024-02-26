export default function Pill({
  classes,
  text,
  onClick,
  identifier = '',
}: {
  classes?: string;
  text: string;
  onClick?: () => void;
  identifier?: string;
}): JSX.Element {
  return (
    <button
      className={`flex h-9 w-full flex-row items-center justify-center rounded-full border border-black text-black hover:bg-neutral-200 disabled:border-neutral-200 disabled:text-neutral-200 dark:border-white dark:text-white dark:hover:bg-gray-700 disabled:dark:border-gray-700 disabled:dark:text-gray-700 ${classes}`}
      onClick={onClick}
      data-test-id="pill"
    >
      <div className={`text-sm font-semibold`}>{text}</div>
    </button>
  );
}
