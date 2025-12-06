import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MahalImageUrlInputsProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

function isValidUrl(url: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (error) {
    return false;
  }
}

export function MahalImageUrlInputs({ value, onChange }: MahalImageUrlInputsProps) {
  const normalizedUrls = useMemo(() => {
    return Array.from({ length: 3 }, (_, index) => value?.[index] ?? "");
  }, [value]);

  const [loadErrors, setLoadErrors] = useState([false, false, false]);

  const handleUrlChange = (index: number, url: string) => {
    const nextUrls = [...normalizedUrls];
    nextUrls[index] = url;
    setLoadErrors((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
    onChange(nextUrls);
  };

  const handleImageError = (index: number) => {
    setLoadErrors((prev) => {
      const next = [...prev];
      next[index] = Boolean(normalizedUrls[index]);
      return next;
    });
  };

  const handleImageLoad = (index: number) => {
    setLoadErrors((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {normalizedUrls.map((url, index) => {
        const hasValue = Boolean(url?.trim());
        const syntaxInvalid = hasValue ? !isValidUrl(url.trim()) : false;
        const invalid = syntaxInvalid || loadErrors[index];

        return (
          <div key={index} className="flex items-center gap-4">
            <div
              className={`w-24 h-24 rounded-lg border ${
                hasValue && !invalid ? "border-border" : "border-dashed border-muted-foreground/50"
              } bg-muted flex items-center justify-center overflow-hidden`}
            >
              {hasValue && !syntaxInvalid ? (
                <img
                  src={url.trim()}
                  alt={`Mahal preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  onLoad={() => handleImageLoad(index)}
                />
              ) : (
                <span className="text-xs text-muted-foreground text-center px-2">No image</span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor={`mahal-image-url-${index}`}>
                Image {index + 1} URL{index === 0 ? " *" : ""}
              </Label>
              <Input
                id={`mahal-image-url-${index}`}
                type="url"
                inputMode="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(event) => handleUrlChange(index, event.target.value)}
                className={invalid ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {invalid && (
                <p className="text-xs text-destructive">Enter a valid image URL that loads correctly.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}






