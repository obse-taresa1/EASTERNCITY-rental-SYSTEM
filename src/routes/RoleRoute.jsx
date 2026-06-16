import { Outlet } from 'react-router-dom'

function RoleRoute({ allowedRoles = [] }) {
  void allowedRoles

  return <Outlet />
}

export default RoleRoute
