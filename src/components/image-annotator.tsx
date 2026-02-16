
import * as React from "react";
import { Product } from "@/types/analysis";

interface ImageAnnotatorProps {
  imageSrc: string;
  products: Product[];
  className?: string;
}

export function ImageAnnotator({ imageSrc, products, className }: ImageAnnotatorProps) {
  // Products have box_2d: [ymin, xmin, ymax, xmax] normalized to 1000.

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-md ${className}`}>
      <img
        src={imageSrc}
        alt="Analyzed Shelf"
        className="w-full h-auto object-contain block"
      />
      {products.map((product, index) => {
        const [ymin, xmin, ymax, xmax] = product.box_2d;

        // Validate coordinates
        if (ymin === undefined || xmin === undefined) return null;

        const top = ymin / 10;
        const left = xmin / 10;
        const height = (ymax - ymin) / 10;
        const width = (xmax - xmin) / 10;

        return (
          <div
            key={index}
            className="absolute border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors z-10 group"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <div className="hidden group-hover:block absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
              {product.name} - {product.price || "N/A"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
