import { forwardRef, useMemo, useState, type ImgHTMLAttributes } from "react";
import { toAbsoluteImageUrl } from "@/utils/apiBase";
import images from "../../../assets/noImage.png";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
};
const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, fallback: customFallback = images, ...props }, ref) => {
    const [fallbackSrc, setFallbackSrc] = useState<string>("");

    const handleError = () => {
      setFallbackSrc(customFallback);
    };

    const effectiveSrc = useMemo(() => {
      const raw = (fallbackSrc || (src as string) || customFallback) as string;
      if (!raw) return customFallback as string;
      return toAbsoluteImageUrl(raw);
    }, [fallbackSrc, src, customFallback]);

    return (
      <img
        ref={ref}
        src={effectiveSrc}
        alt={alt}
        {...props}
        onError={handleError}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
