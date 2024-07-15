import Link from "next/link";
import clsx from "clsx";

interface MobileLinkProps {
  href?: string; // Make href optional
  icon: any;
  active: boolean;
  onClick?: () => void;
}

const MobileLink: React.FC<MobileLinkProps> = ({ href, icon: Icon, active, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href={href || "#"}
      onClick={handleClick}
      className={clsx(
        "group flex justify-center p-4",
        active ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </a>
  );
};

export default MobileLink;
