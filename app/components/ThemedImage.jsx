import Image from "next/image";

function ThemedImage({ light, dark, alt, className = "", ...props }) {
  return (
    <>
      <Image
        src={light}
        alt={alt}
        className={`${className} dark:hidden`}
        {...props}
      />
      <Image
        src={dark}
        alt={alt}
        className={`${className} hidden dark:block`}
        {...props}
      />
    </>
  );
}

export default ThemedImage;
