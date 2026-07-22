import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
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

// Identidad visual por modulo: icono + acento de color (tokens reales de
// design-system.css, no colores inventados) + descripcion de una linea.
// MODULO_VISUAL_DEFAULT cubre modulos futuros (Ingresos/Gastos Fijos) que
// aun no tengan una entrada explicita aqui, para no romper la pantalla.
interface ModuloVisual {
  icono: string;
  colorVar: string;
  softVar: string;
  descripcion: string;
}

const MODULO_LABELS: Record<string, string> = {
  ADMINISTRACION: 'Administración',
  CHIPIS: 'Chipis',
  CONFIGURACION: 'Configuración',
};

const MODULO_VISUAL: Record<string, ModuloVisual> = {
  ADMINISTRACION: {
    icono: 'pi pi-shield',
    colorVar: '--np-teal',
    softVar: '--np-teal-soft',
    descripcion: 'Usuarios, perfiles y control de acceso al sistema.',
  },
  CHIPIS: {
    icono: 'pi pi-sitemap',
    colorVar: '--np-sello',
    softVar: '--np-sello-soft',
    descripcion: 'Órdenes, entradas, recibos, productos y proveedores.',
  },
  CONFIGURACION: {
    icono: 'pi pi-cog',
    colorVar: '--np-neutral',
    softVar: '--np-neutral-bg',
    descripcion: 'Ajustes generales de la empresa activa.',
  },
};

const MODULO_VISUAL_DEFAULT: ModuloVisual = {
  icono: 'pi pi-th-large',
  colorVar: '--np-neutral',
  softVar: '--np-neutral-bg',
  descripcion: '',
};

function formatModuloNombre(nombre: string): string {
  return MODULO_LABELS[nombre] ?? nombre.charAt(0) + nombre.slice(1).toLowerCase();
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

  const bloqueadosPorDependencia = useMemo(() => {
    const requeridos = new Set<number>();
    (matriz ?? []).forEach((item) => {
      if (seleccionados.has(item.permisoId)) {
        item.requierePermisoIds.forEach((id) => requeridos.add(id));
      }
    });
    return requeridos;
  }, [matriz, seleccionados]);

  const toggle = (item: PermisoMatrizItem) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(item.permisoId)) {
        if (bloqueadosPorDependencia.has(item.permisoId)) {
          return prev; // bloqueado: hay que desmarcar antes lo que depende de este
        }
        next.delete(item.permisoId);
      } else {
        next.add(item.permisoId);
        item.requierePermisoIds.forEach((id) => next.add(id)); // marca tambien los requeridos
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
      <div className="permisos-header">
        <h1 className="permisos-titulo">Permisos</h1>
        <p className="permisos-subtitulo">Selecciona un perfil para ver y editar los permisos que tiene en cada módulo.</p>
      </div>

      <Card className="permisos-selector-card">
        <div className="permisos-selector-row">
          <div className="permisos-selector">
            <label htmlFor="perfil" className="permisos-selector-label">
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
        <>
          <div className="permisos-toolbar">
            <h2 className="permisos-toolbar-titulo">Permisos del perfil</h2>
            <Button
              label="Guardar Cambios"
              icon="pi pi-check"
              loading={asignarMutation.isPending}
              onClick={handleGuardar}
            />
          </div>

          {isLoadingMatriz ? (
            <ProgressSpinner />
          ) : (
            <>
              <div className="permisos-info-nota">
                <i className="pi pi-info-circle" />
                <span>
                  Marca las casillas para otorgar ese permiso al perfil seleccionado. Los cambios no se guardan hasta
                  presionar «Guardar Cambios». Un candado <i className="pi pi-lock" /> significa que otro permiso ya
                  marcado lo necesita para funcionar.
                </span>
              </div>

              <div className="permisos-modulos">
                {modulosAgrupados.map(([moduloNombre, items]) => {
                  const visual = MODULO_VISUAL[moduloNombre] ?? MODULO_VISUAL_DEFAULT;
                  const marcados = items.filter((item) => seleccionados.has(item.permisoId)).length;
                  return (
                    <div
                      key={moduloNombre}
                      className="permisos-modulo-card"
                      style={
                        {
                          '--modulo-color': `var(${visual.colorVar})`,
                          '--modulo-soft': `var(${visual.softVar})`,
                        } as CSSProperties
                      }
                    >
                      <div className="permisos-modulo-header">
                        <span className="permisos-modulo-icono">
                          <i className={visual.icono} />
                        </span>
                        <div className="permisos-modulo-titulo-bloque">
                          <div className="permisos-modulo-titulo">
                            {formatModuloNombre(moduloNombre)}
                            <span className="permisos-modulo-contador">
                              {marcados}/{items.length}
                            </span>
                          </div>
                          {visual.descripcion && <div className="permisos-modulo-desc">{visual.descripcion}</div>}
                        </div>
                      </div>
                      <div className="permisos-modulo-items">
                        {items.map((item) => {
                          // Bloqueado SOLO si ya esta marcado (no se puede desmarcar
                          // mientras algo dependa de el). Si esta desmarcado, debe
                          // poder marcarse aunque algo lo requiera -- si no, un perfil
                          // armado antes de esta regla (ej. con ORDENES_CREAR ya
                          // marcado pero PROVEEDORES_LEER sin marcar) mostraria un
                          // checkbox desmarcado Y deshabilitado, sin forma de corregirlo
                          // manualmente desde la UI.
                          const bloqueado =
                            seleccionados.has(item.permisoId) && bloqueadosPorDependencia.has(item.permisoId);
                          return (
                            <label key={item.permisoId} className="permisos-item">
                              <Checkbox
                                checked={seleccionados.has(item.permisoId)}
                                disabled={bloqueado}
                                onChange={() => toggle(item)}
                              />
                              <span className="permisos-item-label">{formatAccion(item)}</span>
                              {bloqueado && (
                                <i
                                  className="pi pi-lock permisos-item-requerido-icono"
                                  title="Requerido por otro permiso marcado en este perfil"
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="permisos-footer-nota">
                <i className="pi pi-question-circle" />
                ¿Dudas sobre qué permiso necesita cada pantalla? Pasa el cursor sobre el candado para ver de cuál
                depende.
              </div>
            </>
          )}
        </>
      )}

      <PerfilFormDialog visible={dialogVisible} perfil={editingPerfil} onHide={() => setDialogVisible(false)} />
    </div>
  );
}
