import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { usePerfilesQuery } from '../../hooks/permisos/usePerfilesQuery';
import { useMatrizQuery } from '../../hooks/permisos/useMatrizQuery';
import { useAsignarPermisos } from '../../hooks/permisos/useAsignarPermisos';
import { PerfilFormDialog } from './PerfilFormDialog';
import type { Perfil, PermisoMatrizItem } from '../../types/permiso.types';
import '../../assets/styles/permisos.css';

function formatAccion(item: PermisoMatrizItem): string {
  const descripcion = (item as PermisoMatrizItem & { descripcion?: string }).descripcion;
  if (descripcion) return descripcion;
  return item.accion.replace(/_/g, ' ').toLowerCase();
}

export function PermisosPage() {
  const { data: perfilesData } = usePerfilesQuery();
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const { data: matriz, isLoading: isLoadingMatriz } = useMatrizQuery(perfilId ?? undefined);
  const asignarMutation = useAsignarPermisos();

  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    if (matriz) {
      setSeleccionados(new Set(matriz.filter((item) => item.asignado).map((item) => item.permisoId)));
    }
  }, [matriz]);

  const perfiles = perfilesData?.data ?? [];
  const perfilSeleccionado = perfiles.find((p) => p.id === perfilId) ?? null;

  const modulosAgrupados = useMemo(() => {
    const grupos = new Map<string, PermisoMatrizItem[]>();
    (matriz ?? []).forEach((item) => {
      const lista = grupos.get(item.moduloNombre) ?? [];
      lista.push(item);
      grupos.set(item.moduloNombre, lista);
    });
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b));
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

  const openCreateDialog = () => {
    setEditingPerfil(null);
    setDialogVisible(true);
  };

  const openEditDialog = () => {
    if (!perfilSeleccionado) return;
    setEditingPerfil(perfilSeleccionado);
    setDialogVisible(true);
  };

  return (
    <div className="permisos-page">
      <Card title="Permisos">
        <div className="permisos-selector-row">
          <div className="permisos-selector">
            <label
              htmlFor="perfil"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}
            >
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
          <div className="permisos-selector-actions">
            <Button label="Nuevo Perfil" icon="pi pi-plus" outlined onClick={openCreateDialog} />
            {perfilSeleccionado && (
              <Button label="Editar Perfil" icon="pi pi-pencil" text onClick={openEditDialog} />
            )}
          </div>
        </div>
      </Card>

      {perfilId !== null && (
        <Card title="Permisos del Perfil">
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
              <div className="permisos-modulos">
                {modulosAgrupados.map(([moduloNombre, items]) => (
                  <div key={moduloNombre} className="permisos-modulo-card">
                    <h3 className="permisos-modulo-titulo">{moduloNombre}</h3>
                    <div className="permisos-modulo-items">
                      {items.map((item) => (
                        <label key={item.permisoId} className="permisos-item">
                          <Checkbox
                            checked={seleccionados.has(item.permisoId)}
                            onChange={() => toggle(item.permisoId)}
                          />
                          <span>{formatAccion(item)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      <PerfilFormDialog visible={dialogVisible} perfil={editingPerfil} onHide={() => setDialogVisible(false)} />
    </div>
  );
}
