
"use client";

import { useEffect, useRef, useState } from "react";

const ModelViewerElement = "model-viewer" as React.ElementType;

interface ProductModelViewerProps {
  src: string;
  alt: string;
}

export default function ProductModelViewer({
  src,
  alt,
}: ProductModelViewerProps) {
  const viewerRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initializeViewer = async () => {
      try {
        await import("@google/model-viewer");

        if (!mounted) return;

        const viewer = viewerRef.current;
        if (!viewer) return;

        const handleLoad = () => {
          setLoading(false);
          setError(false);
        };

        const handleError = () => {
          setLoading(false);
          setError(true);
        };

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);

        // Explicitly enable native model-viewer controls.
        viewer.setAttribute("camera-controls", "");
        viewer.setAttribute("touch-action", "pan-y");
        viewer.setAttribute("auto-rotate", "");
        viewer.setAttribute("rotation-per-second", "20deg");
        viewer.setAttribute("shadow-intensity", "1");
        viewer.setAttribute("exposure", "1");

        // Handle the possibility that the model loaded
        // before the event listeners were registered.
        if (viewer.hasAttribute("loaded")) {
          setLoading(false);
        }

        cleanup = () => {
          viewer.removeEventListener("load", handleLoad);
          viewer.removeEventListener("error", handleError);
        };
      } catch (error) {
        console.error("Model viewer initialization failed:", error);

        if (mounted) {
          setLoading(false);
          setError(true);
        }
      }
    };

    initializeViewer();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [src]);

  return (
    <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100 md:min-h-[520px]">
      {loading && !error && (
        <div className="absolute z-10 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600" />
          <p className="text-sm text-gray-500">
            Loading 3D model...
          </p>
        </div>
      )}

      {error ? (
        <div className="p-8 text-center">
          <p className="font-semibold text-gray-800">
            Unable to load the 3D model.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please refresh and try again.
          </p>
        </div>
      ) : (
        <ModelViewerElement
          ref={viewerRef}
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "360px",
            backgroundColor: "transparent",
            pointerEvents: "auto",
            touchAction: "pan-y",
          }}
        />
      )}

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
        Drag to rotate · Scroll or pinch to zoom
      </div>
    </div>
  );
}
