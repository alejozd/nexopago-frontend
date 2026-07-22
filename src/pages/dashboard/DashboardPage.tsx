import dayjs from 'dayjs';
import 'dayjs/locale/es';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
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
import { hasPermiso } from '../../utils/permisos';
import type { ReciboCaja } from '../../types/recibo.types';
import '../../assets/styles/dashboard.css';

function saludoDelDia(): string {
  const hora = dayjs().hour();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Variar solo luminosidad/saturacion dentro de un mismo matiz se percibe como
// "el mismo color" a simple vista: el ojo distingue matices distintos mucho
// mejor que tonos claros/oscuros del mismo color. Por eso el matiz rota entre
// verde y azul (150-210), pasando por el --np-teal (172) del sistema de
// diseño, y se evitan naranja/rojo/amarillo porque ya tienen significado
// semantico (warning/danger) en otras pantallas.
// ApexCharts usa hexToRgb/shadeColor internamente para sombreados y
// gradientes (no interpreta hsl() en esos calculos), asi que el color se
// resuelve a hex aqui en vez de devolver el string hsl() directamente.
function hslToHex(matiz: number, saturacion: number, luminosidad: number): string {
  const s = saturacion / 100;
  const l = luminosidad / 100;
  const k = (n: number) => (n + matiz / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const aHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${aHex(f(0))}${aHex(f(8))}${aHex(f(4))}`;
}

function colorMesHex(indice: number, total: number, ajusteLuminosidad = 0): string {
  const t = total <= 1 ? 0 : indice / (total - 1);
  const matiz = 150 + t * 60;
  const luminosidad = Math.min(90, 45 + ajusteLuminosidad);
  return hslToHex(matiz, 55, luminosidad);
}

export function DashboardPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const puedeVerRecibos = hasPermiso(usuario?.permisos, 'CHIPIS:RECIBOS_LEER');
  const { data: dashboard, isLoading, isError } = useDashboardQuery();
  const { data: ultimosRecibos, isLoading: isLoadingRecibos } = useUltimosRecibosQuery(puedeVerRecibos);

  if (isLoading) {
    return <ProgressSpinner />;
  }

  if (isError || !dashboard) {
    return <p>No fue posible cargar el dashboard.</p>;
  }

  const totalMeses = dashboard.pagosMensuales.length;
  const paletteMeses = dashboard.pagosMensuales.map((_, i) => colorMesHex(i, totalMeses));
  const paletteMesesClara = dashboard.pagosMensuales.map((_, i) => colorMesHex(i, totalMeses, 22));

  const barSeries = [
    {
      name: 'Pagos mensuales',
      data: dashboard.pagosMensuales.map((p) => p.total),
    },
  ];

  // Con la mayoria de los meses en 0 y uno solo con datos, dejar que ApexCharts
  // auto-escale el eje Y a su "numero redondo" habitual (ej. 800k cuando el
  // maximo real es 675k) deja un margen vacio notorio arriba de la barra. Se
  // fija un maximo ajustado al dato real (+15%) en vez de al numero redondo.
  const maxPagoMensual = Math.max(0, ...dashboard.pagosMensuales.map((p) => p.total));

  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      // Cascada: cada barra entra con un pequeño retraso respecto a la
      // anterior en vez de todas a la vez (animateGradually.delay).
      animations: {
        enabled: true,
        easing: 'easeout',
        speed: 700,
        animateGradually: { enabled: true, delay: 90 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      dropShadow: {
        enabled: true,
        top: 4,
        blur: 6,
        color: '#16241f',
        opacity: 0.25,
      },
    },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 6,
        columnWidth: '55%',
      },
    },
    colors: paletteMeses,
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: paletteMesesClara,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: { categories: dashboard.pagosMensuales.map((p) => formatMonthPeriod(p.periodo)) },
    yaxis: {
      max: maxPagoMensual > 0 ? maxPagoMensual * 1.15 : undefined,
      labels: { formatter: (value: number) => formatCurrencyCompact(value) },
    },
    tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
  };

  const pieSeries = dashboard.ordenesPorEstado.map((o) => o.cantidad);

  const pieOptions: ApexOptions = {
    chart: { type: 'donut' },
    labels: dashboard.ordenesPorEstado.map((o) => o.estado),
    // Literales en sincronia manual con los tokens semanticos (--np-teal/
    // --np-warning/--np-success/--np-danger/--np-neutral). Se evita
    // --np-sello a proposito: el sistema de diseño lo reserva como EL unico
    // acento, no para series de charts.
    colors: ['#0E6B62', '#A8660F', '#1B7A4D', '#B3261E', '#46596E'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };

  // pagosPendientes (conteo de ordenes ACTIVAS con saldo > 0) y valorTotalCartera
  // (suma en $ del saldo) no son comparables como porcentaje entre si -- uno es
  // conteo y el otro es dinero. El gauge usa en cambio dos conteos que SI son
  // comparables: recibos creados este mes vs ordenes aun en flujo pendiente
  // (BORRADOR/PENDIENTE/PARCIALMENTE_RECIBIDA), como "tasa de resolucion" del
  // mes en curso.
  const totalFlujoMes = dashboard.recibosCreados + dashboard.ordenesPendientes;
  const porcentajeResuelto =
    totalFlujoMes > 0 ? Math.round((dashboard.recibosCreados / totalFlujoMes) * 100) : 0;
  const radialSeries = [porcentajeResuelto];

  const radialOptions: ApexOptions = {
    chart: { type: 'radialBar' },
    // ApexCharts fija "fill" como atributo SVG (no como propiedad CSS por
    // style), asi que var(--np-*) no se resuelve aqui: mismo motivo que en
    // los otros dos graficos, el color va literal en hex.
    colors: ['#0E6B62'],
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        track: { background: '#E4E9E7' },
        dataLabels: {
          name: { fontSize: '0.8rem', color: '#46596E', offsetY: 24 },
          value: {
            fontSize: '1.9rem',
            fontWeight: 700,
            color: '#16241F',
            offsetY: -8,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    labels: ['Resuelto este mes'],
  };

  // Top 5 proveedores con mayor saldo pendiente (ya viene ordenado desc y
  // limitado a 5 desde el backend, ver NexoPago.Services.Dashboard.pas).
  const proveedoresOrdenados = [...dashboard.topProveedoresCartera].reverse();
  const paletteProveedores = proveedoresOrdenados.map((_, i) =>
    colorMesHex(i, proveedoresOrdenados.length),
  );
  const proveedorSeries = [
    {
      name: 'Saldo pendiente',
      data: proveedoresOrdenados.map((p) => p.saldoPendienteTotal),
    },
  ];

  const proveedorOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        barHeight: '55%',
      },
    },
    // Mismo mecanismo de colorMesHex que Pagos Mensuales: rotacion de matiz
    // sutil (verde-azul), no un color por barra sin relacion entre si.
    colors: paletteProveedores,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => formatCurrencyCompact(val),
      style: { colors: ['#ffffff'] },
    },
    xaxis: {
      categories: proveedoresOrdenados.map((p) => p.proveedorNombre),
      labels: { formatter: (value: string) => formatCurrencyCompact(Number(value)) },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
  };

  // Tendencia de entradas de mercancia (ultimas 8 semanas, ver
  // NexoPago.Services.Dashboard.pas). Barras en vez de area: son 8 puntos
  // semanales, categorias discretas a comparar entre si, no una serie
  // continua densa como para justificar una linea/area.
  const entradaSeries = [
    {
      name: 'Entradas',
      data: dashboard.entradasRecientes.map((e) => e.cantidad),
    },
  ];

  const entradaOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#0E6B62'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: dashboard.entradasRecientes.map((e) => dayjs(e.semanaInicio).locale('es').format('DD MMM')),
    },
    yaxis: { labels: { formatter: (value: number) => Math.round(value).toString() } },
    tooltip: {
      x: {
        formatter: (_val: number, opts) =>
          `Semana del ${dayjs(dashboard.entradasRecientes[opts.dataPointIndex].semanaInicio).locale('es').format('DD/MM/YYYY')}`,
      },
    },
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

      <div className="kpi-hero-row">
        <KpiCard
          icon="pi pi-wallet"
          label="Valor Total de Cartera"
          value={formatCurrency(dashboard.valorTotalCartera)}
          accent="success"
          size="compact"
          destacado
          subtitulo={`Repartido en ${dashboard.pagosPendientes} orden${dashboard.pagosPendientes === 1 ? '' : 'es'} pendiente${dashboard.pagosPendientes === 1 ? '' : 's'}`}
        />
        <div className="kpi-row kpi-hero-secundarias">
          <KpiCard
            icon="pi pi-shopping-cart"
            label="Órdenes Pendientes"
            value={String(dashboard.ordenesPendientes)}
            accent="warning"
            size="compact"
            subtitulo="Actualmente en proceso"
          />
          <KpiCard
            icon="pi pi-receipt"
            label="Recibos Creados"
            value={String(dashboard.recibosCreados)}
            accent="primary"
            size="compact"
            subtitulo="Registrados este periodo"
          />
          <KpiCard
            icon="pi pi-clock"
            label="Pagos Pendientes"
            value={String(dashboard.pagosPendientes)}
            accent="danger"
            size="compact"
            subtitulo="Requieren atención inmediata"
          />
        </div>
      </div>

      <div className="dashboard-charts">
        <Card title="Pagos mensuales" className="dashboard-chart-card--normal">
          <div className="dashboard-chart-wrap">
            <Chart type="bar" series={barSeries} options={barOptions} width="100%" height={300} />
          </div>
        </Card>
        <Card title="Órdenes por Estado" className="dashboard-chart-card--normal">
          <div className="dashboard-chart-wrap dashboard-chart-wrap-pie">
            <Chart type="donut" series={pieSeries} options={pieOptions} width="100%" height={300} />
          </div>
        </Card>
        <Card title="Recibos vs. Pendientes (mes)" className="dashboard-chart-card--normal">
          <div className="dashboard-chart-wrap dashboard-chart-wrap-pie">
            <Chart type="radialBar" series={radialSeries} options={radialOptions} width="100%" height={300} />
          </div>
          <p className="dashboard-chart-footnote">
            {dashboard.recibosCreados} recibos creados / {dashboard.ordenesPendientes} órdenes aún pendientes
          </p>
        </Card>
        <Card title="Top 5 Proveedores por Saldo Pendiente" className="dashboard-chart-card--ancho">
          <div className="dashboard-chart-wrap">
            <Chart type="bar" series={proveedorSeries} options={proveedorOptions} width="100%" height={300} />
          </div>
        </Card>
        <Card title="Entradas de Mercancía (últimas 8 semanas)" className="dashboard-chart-card--ancho">
          <div className="dashboard-chart-wrap">
            <Chart type="bar" series={entradaSeries} options={entradaOptions} width="100%" height={300} />
          </div>
        </Card>
      </div>

      {puedeVerRecibos && (
        <Card title="Últimos recibos de caja">
          <DataTable value={ultimosRecibos?.data ?? []} loading={isLoadingRecibos} stripedRows size="small">
            <Column field="numeroRecibo" header="ID" />
            <Column field="proveedorNombre" header="Proveedor" />
            <Column field="fechaRecibo" header="Fecha" body={(row: ReciboCaja) => formatDate(row.fechaRecibo)} />
            <Column field="estado" header="Estado" body={(row: ReciboCaja) => <StatusTag status={row.estado} />} />
            <Column field="monto" header="Valor" body={(row: ReciboCaja) => formatCurrency(row.monto)} />
          </DataTable>
        </Card>
      )}
    </div>
  );
}
