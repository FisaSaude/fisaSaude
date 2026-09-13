import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import ClientBooking from "./pages/client/ClientBooking";
import ClientSelectTime from "./pages/client/ClientSelectTime";
import ClientConfirmation from "./pages/client/ClientConfirmation";
import ClientSuccess from "./pages/client/ClientSuccess";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Schedule from "./pages/admin/Schedule";
import Clients from "./pages/admin/Clients";
import ClientProfile from "./pages/admin/ClientProfile";
import RelacionamentoComercial from "./pages/admin/RelacionamentoComercial";
import Financial from "./pages/admin/Financial";
import Settings from "./pages/admin/Settings";
import Logs from "./pages/admin/Logs";
import AdminLayout from "./layouts/AdminLayout";
import RootLayout from "./layouts/RootLayout";
import TeamManagement from './pages/admin/TeamManagement';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "agendar",
        Component: ClientBooking,
      },
      {
        path: "agendar/horario",
        Component: ClientSelectTime,
      },
      {
        path: "agendar/confirmacao",
        Component: ClientConfirmation,
      },
      {
        path: "agendar/sucesso",
        Component: ClientSuccess,
      },
      {
        path: "admin/login",
        Component: Login,
      },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "agenda", Component: Schedule },
          { path: "clientes", Component: Clients },
          { path: "clientes/:id", Component: ClientProfile },
          { path: "equipe", Component: TeamManagement },
          { path: "relacionamento", Component: RelacionamentoComercial },
          { path: "financeiro", Component: Financial },
          { path: "logs", Component: Logs },
          { path: "configuracoes", Component: Settings },
        ],
      },
    ],
  },
]);