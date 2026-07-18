import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDashboardQuery } from '../../hooks/dashboard/useDashboardQuery';
import { useUltimosRecibosQuery } from '../../hooks/dashboard/useUltimosRecibosQuery';
import { useAuthStore } from '../../store/authStore';
import { StatusTag } from '../../components/common/StatusTag';
import { KpiCard } from '../../components/common/KpiCard';
import { formatCurrency, formatCurrencyCompact, formatDate, formatMonthPeriod } from '../../utils/formatters';
import type { ReciboCaja } from '../../types/recibo.types';
import '../../assets/styles/dashboard.css';

function saludoDelDia(): string {
  const hora = dayjs().hour();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function DashboardPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const { data: dashboard, isLoading, isError } = useDashboardQuery();
  const { data: ultimosRecibos, isLoading: isLoadingRecibos } = useUltimosRecibosQuery();

  if (isLoading) {
    return <ProgressSpinner />;
  }

  if (isError || !dashboard) {
    return <p>No fue posible cargar el dashboard.</p>;
  }

  const barData = {
    labels: dashboard.pagosMensuales.map((p) => formatMonthPeriod(p.periodo)),
    datasets: [
      {
        label: 'Pagos mensuales',
        data: dashboard.pagosMensuales.map((p) => p.total),
        // Chart.js dibuja en un <canvas>, que no resuelve custom properties
        // CSS (var(--np-*)) porque no forma parte del DOM/CSSOM — el color
        // se fija literal, en sincronia manual con --np-teal del sistema de
        // diseño (dato secundario, no el acento de sello exclusivo).
        backgroundColor: '#0E6B62',
      },
    ],
  };

  const pieData = {
    labels: dashboard.ordenesPorEstado.map((o) => o.estado),
    datasets: [
      {
        data: dashboard.ordenesPorEstado.map((o) => o.cantidad),
        // Mismo motivo que arriba: literales en sincronia manual con los
        // tokens semanticos (--np-teal/--np-warning/--np-success/--np-danger/
        // --np-neutral). Se evita --np-sello a proposito: el sistema de
        // diseño lo reserva como EL unico acento, no para series de charts.
        backgroundColor: ['#0E6B62', '#A8660F', '#1B7A4D', '#B3261E', '#46596E'],
      },
    ],
  };

  // Con la mayoria de los meses en 0 y uno solo con datos, dejar que Chart.js
  // auto-escale el eje Y a su "numero redondo" habitual (ej. 800k cuando el
  // maximo real es 675k) deja un margen vacio notorio arriba de la barra. Se
  // fija un maximo ajustado al dato real (+15%) en vez de al numero redondo.
  const maxPagoMensual = Math.max(0, ...dashboard.pagosMensuales.map((p) => p.total));
  const barOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: maxPagoMensual > 0 ? maxPagoMensual * 1.15 : undefined,
        ticks: {
          callback: (value: number | string) => formatCurrencyCompact(Number(value)),
        },
      },
    },
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-greeting">
        <h2>
          {saludoDelDia()}
          {usuario ? `, ${usuario.nombre}` : ''} 👋
        </h2>
        <p>{dayjs().locale('es').format('dddd, D [de] MMMM [de] YYYY')}</p>
      </div>

      <div className="kpi-row">
        <KpiCard
          icon="pi pi-shopping-cart"
          label="Órdenes Pendientes"
          value={String(dashboard.ordenesPendientes)}
          accent="warning"
          size="compact"
        />
        <KpiCard
          icon="pi pi-receipt"
          label="Recibos Creados"
          value={String(dashboard.recibosCreados)}
          accent="primary"
          size="compact"
        />
        <KpiCard
          icon="pi pi-clock"
          label="Pagos Pendientes"
          value={String(dashboard.pagosPendientes)}
          accent="danger"
          size="compact"
        />
        <KpiCard
          icon="pi pi-wallet"
          label="Valor Total de Cartera"
          value={formatCurrency(dashboard.valorTotalCartera)}
          accent="success"
          size="compact"
        />
      </div>

      <div className="dashboard-charts">
        <Card title="Pagos mensuales">
          <div className="dashboard-chart-wrap">
            <Chart type="bar" data={barData} options={barOptions} />
          </div>
        </Card>
        <Card title="Órdenes por Estado">
          <div className="dashboard-chart-wrap dashboard-chart-wrap-pie">
            <Chart type="pie" data={pieData} options={pieOptions} />
          </div>
        </Card>
      </div>

      <Card title="Últimos recibos de caja">
        <DataTable value={ultimosRecibos?.data ?? []} loading={isLoadingRecibos} stripedRows size="small">
          <Column field="numeroRecibo" header="ID" />
          <Column field="proveedorNombre" header="Proveedor" />
          <Column field="fechaRecibo" header="Fecha" body={(row: ReciboCaja) => formatDate(row.fechaRecibo)} />
          <Column field="estado" header="Estado" body={(row: ReciboCaja) => <StatusTag status={row.estado} />} />
          <Column field="monto" header="Valor" body={(row: ReciboCaja) => formatCurrency(row.monto)} />
        </DataTable>
      </Card>
    </div>
  );
}
