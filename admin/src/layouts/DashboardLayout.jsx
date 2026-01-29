import { Outlet } from "react-router";

function DashboardLayout() {
  return (
  <div>
    <h1>sidebar</h1>
    <h2>navbar</h2>
    <Outlet />
  </div>

  )
}
export default DashboardLayout;