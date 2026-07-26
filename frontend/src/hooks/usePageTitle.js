import { useEffect } from "react";

/**
 * Sets the browser tab title to `pageName | Eastern Cities`.
 * Resets to the default when the component unmounts.
 *
 * @param {string} pageName - The page-specific part of the title.
 */
export default function usePageTitle(pageName) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageName
      ? `${pageName} | Eastern Cities`
      : "Eastern Cities | Rental Marketplace";
    return () => {
      document.title = prev;
    };
  }, [pageName]);
}
