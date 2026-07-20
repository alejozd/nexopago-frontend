import { useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { confirmDialog } from 'primereact/confirmdialog';
import { useConfiguracionEmpresaQuery } from '../../hooks/empresaActiva/useConfiguracionEmpresaQuery';
import { useEmpresasHelisaDisponiblesQuery } from '../../hooks/empresaActiva/useEmpresasHelisaDisponiblesQuery';
import { useCambiarEmpresaActiva } from '../../hooks/empresaActiva/useCambiarEmpresaActiva';
import { showErrorToast } from '../../utils/toastRef';
import { formatDateTime } from '../../utils/formatters';
import type { EmpresaActivaHistorialItem } from '../../types/empresaActiva.types';
import '../../assets/styles/empresa-activa.css';

export function EmpresaActivaPage() {
  const { data: config, isLoading: isLoadingConfig } = useConfiguracionEmpresaQuery();
  const { data: empresasDisponibles, isLoading: isLoadingDisponibles } = useEmpresasHelisaDisponiblesQuery();
  const cambiarMutation = useCambiarEmpresaActiva();

  const [codigoSeleccionado, setCodigoSeleccionado] = useState<number | null>(null);

  const empresaSeleccionada = (empresasDisponibles ?? []).find((e) => e.codigo === codigoSeleccionado);

  const confirmCambiar = () => {
    if (codigoSeleccionado === null || !empresaSeleccionada) return;

    confirmDialog({
      header: 'Cambiar empresa activa',
      message: (
        <div>
          <p>
            ¿Cambiar la empresa activa a <strong>{`${empresaSeleccionada.codigo} - ${empresaSeleccionada.nombre}`}</strong>?
          </p>
          <p style={{ color: 'var(--red-600)', fontWeight: 600 }}>
            Advertencia: este cambio afecta inmediatamente la sincronización de productos y la carga de
            pedidos del ERP en todo el sistema. Revise cuidadosamente antes de confirmar.
          </p>
        </div>
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Cambiar empresa',
      rejectLabel: 'Cancelar',
      accept: () => {
        cambiarMutation.mutate(
          { codigoEmpresa: codigoSeleccionado },
          {
            onError: (error) => {
              showErrorToast(error.message ?? 'No fue posible cambiar la empresa activa');
            },
          },
        );
      },
    });
  };

  if (isLoadingConfig) {
    return (
      <Card title="Configuración">
        <ProgressSpinner />
      </Card>
    );
  }

  return (
    <div>
      {config?.tieneConfiguracion && config.empresaActiva && (
        <Card title="Empresa Activa">
          <div className="empresa-activa-actual">
            <span className="pi pi-building" style={{ fontSize: '1.5rem', color: 'var(--np-sello-text)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {config.empresaActiva.codigo} - {config.empresaActiva.nombre}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>
                Activada el {formatDateTime(config.empresaActiva.fechaActivacion)}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card title="Cambiar Empresa Activa" className="mt-3">
        {!config?.tieneConfiguracion && (
          <Message
            severity="warn"
            className="mb-3"
            text="Aún no hay una empresa activa configurada. Seleccione una empresa del ERP para comenzar a sincronizar productos y pedidos."
            style={{ width: '100%' }}
          />
        )}

        <div className="empresa-activa-selector">
          <label
            htmlFor="empresaErp"
            style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}
          >
            Empresa
          </label>
          <Dropdown
            id="empresaErp"
            value={codigoSeleccionado}
            options={empresasDisponibles ?? []}
            optionLabel="nombre"
            optionValue="codigo"
            itemTemplate={(option) => `${option.codigo} - ${option.nombre}`}
            valueTemplate={(option) =>
              option ? `${option.codigo} - ${option.nombre}` : 'Selecciona una empresa'
            }
            placeholder="Selecciona una empresa"
            loading={isLoadingDisponibles}
            filter
            filterBy="codigo,nombre"
            style={{ width: '100%', maxWidth: '28rem' }}
            onChange={(e) => setCodigoSeleccionado(e.value)}
          />
        </div>

        <div className="page-header-actions">
          <Button
            label="Cambiar empresa activa"
            icon="pi pi-sync"
            severity="warning"
            disabled={codigoSeleccionado === null}
            loading={cambiarMutation.isPending}
            onClick={confirmCambiar}
          />
        </div>
      </Card>

      <Card title="Historial de Cambios" className="mt-3">
        <DataTable
          value={config?.historial ?? []}
          stripedRows
          paginator
          rows={10}
          emptyMessage="Sin cambios registrados."
        >
          <Column field="usuarioNombre" header="Usuario" />
          <Column
            header="Fecha"
            body={(row: EmpresaActivaHistorialItem) => formatDateTime(row.fechaCambio)}
          />
          <Column
            header="Empresa Anterior"
            body={(row: EmpresaActivaHistorialItem) =>
              row.codigoAnterior !== null ? `${row.codigoAnterior} - ${row.nombreAnterior}` : 'N/A'
            }
          />
          <Column
            header="Empresa Nueva"
            body={(row: EmpresaActivaHistorialItem) => `${row.codigoNuevo} - ${row.nombreNuevo}`}
          />
        </DataTable>
      </Card>
    </div>
  );
}
