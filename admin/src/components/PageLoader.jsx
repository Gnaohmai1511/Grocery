import { LoaderIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-base-100 ">
      <LoaderIcon className="size-12 animate-spin text-primary" />
    </div>
  );
}
export default PageLoader;