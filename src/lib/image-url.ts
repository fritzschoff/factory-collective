import { getImageProps } from 'next/image';

/**
 * The optimizer URL of a picture ("/_next/image?url=<file>&w=<width>&q=75") for the places that cannot use <Image>:
 * a CSS background, an SVG <image>, the window in the menu. Next builds it, so basePath, trailingSlash and the
 * images settings apply as they do for <Image>. `width` is rounded up to a size Next serves: ask for what the box
 * needs. An SVG, or images.unoptimized, gives the file itself.
 */
export function optimizedSrc(src: string, width: number): string {
  // The height only satisfies the API, the URL depends on the width. srcSet reads "<url at width> 1x, <url at twice
  // the width> 2x": the first entry is the width asked for, where props.src would be the 2x one.
  const { props } = getImageProps({ src, alt: '', width, height: width });
  return props.srcSet ? props.srcSet.split(', ')[0].split(' ')[0] : props.src;
}
