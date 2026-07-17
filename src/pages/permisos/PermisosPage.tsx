import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { usePerfilesQuery } from '../../hooks/permisos/usePerfilesQuery';
import { useMatrizQuery } from '../../hooks/permisos/useMatrizQuery';
import { useAsignarPermisos } from '../../hooks/permisos/useAsignarPermisos';
import type { PermisoMatrizItem } from '../../types/permiso.types';
import '../../assets/styles/permisos.css';

interface ModuloRow {
  modulo: string;
}

export function PermisosPage() {
  const { data: perfilesData } = usePerfilesQuery();
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const { data: matriz, isLoading: isLoadingMatriz } = useMatrizQuery(perfilId ?? undefined);
  const asignarMutation = useAsignarPermisos();

  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (matriz) {
      setSeleccionados(new Set(matriz.filter((item) => item.asignado).map((item) => item.permisoId)));
    }
  }, [matriz]);

  const perfiles = perfilesData?.data ?? [];

  const modulos = useMemo(() => {
    const nombres = new Set((matriz ?? []).map((item) => item.moduloNombre));
    return Array.from(nombres).sort();
  }, [matriz]);

  const acciones = useMemo(() => {
    const nombres = new Set((matriz ?? []).map((item) => item.accion));
    return Array.from(nombres).sort();
  }, [matriz]);

  const lookup = useMemo(() => {
    const map = new Map<string, PermisoMatrizItem>();
    (matriz ?? []).forEach((item) => map.set(`${item.moduloNombre}|${item.accion}`, item));
    return map;
  }, [matriz]);

  const toggle = (permisoId: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(permisoId)) {
        next.delete(permisoId);
      } else {
        next.add(permisoId);
      }
      return next;
    });
  };

  const handleGuardar = () => {
    if (perfilId === null) return;
    asignarMutation.mutate({ perfilId, permisoIds: Array.from(seleccionados) });
  };

  const moduloRows: ModuloRow[] = modulos.map((modulo) => ({ modulo }));

  return (
    <div className="permisos-page">
      <Card title="Permisos">
        <div className="permisos-selector">
          <label htmlFor="perfil" style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            Perfil
          </label>
          <Dropdown
            id="perfil"
            value={perfilId}
            options={perfiles}
            optionLabel="nombre"
            optionValue="id"
            placeholder="Selecciona un perfil"
            style={{ width: '100%' }}
            onChange={(e) => setPerfilId(e.value)}
          />
        </div>
      </Card>

      {perfilId !== null && (
        <Card title="Matriz de Permisos">
          {isLoadingMatriz ? (
            <ProgressSpinner />
          ) : (
            <>
              <Message
                severity="info"
                className="permisos-matriz-info"
                text="Marca las casillas para otorgar ese permiso al perfil seleccionado, en cada módulo. Los cambios no se guardan hasta presionar «Guardar Cambios»."
              />
              <div className="permisos-matriz-toolbar">
                <Button
                  label="Guardar Cambios"
                  icon="pi pi-check"
                  loading={asignarMutation.isPending}
                  onClick={handleGuardar}
                />
              </div>
              <DataTable value={moduloRows} dataKey="modulo" stripedRows size="small">
                <Column field="modulo" header="Módulo" />
                {acciones.map((accion) => (
                  <Column
                    key={accion}
                    header={accion}
                    alignHeader="center"
                    body={(row: ModuloRow) => {
                      const item = lookup.get(`${row.modulo}|${accion}`);
                      if (!item) return null;
                      return (
                        <div className="permisos-matriz-check">
                          <Checkbox
                            checked={seleccionados.has(item.permisoId)}
                            onChange={() => toggle(item.permisoId)}
                          />
                        </div>
                      );
                    }}
                  />
                ))}
              </DataTable>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
