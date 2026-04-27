"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DinRail from "./DinRail";
import {
  buildPanelLayout,
  distributeOnRails,
  type PanelGroup,
  type PanelItem,
} from "@/lib/calculator/panel-layout";
import type { CalculationResult } from "@/lib/calculator/calculator";
import { Card, CardContent } from "@/components/ui/card";
import { Package, GripVertical } from "lucide-react";
// Перед return добавляем комментарий-заголовок
export default function PanelVisualization({
  result,
}: {
  result: CalculationResult;
}) {
  // Строим первоначальную схему
  const initialLayout = buildPanelLayout(result);
  const [groups, setGroups] = useState<PanelGroup[]>(initialLayout.groups);

  // Сенсоры для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Не перемещаем вводной автомат (первая группа)
    if (active.id === "input" || over.id === "input") return;

    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setGroups(arrayMove(groups, oldIndex, newIndex));
    }
  };

  // Собираем все модули из всех групп в плоский список для рейки
  const allItems = groups.flatMap((g) => g.items);
  const rails = distributeOnRails(
    allItems,
    initialLayout.recommendedEnclosure.modulesPerRail
  );

  return (
    <div className="space-y-6">
      {/* Визуализация щита */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-bold text-[#D1D4DC] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Схема щита
              </h3>
              <p className="text-sm text-[#787B86]">
                Корпус: {initialLayout.recommendedEnclosure.name} ·{" "}
                {initialLayout.totalModules} из{" "}
                {initialLayout.recommendedEnclosure.modules} модулей ·{" "}
                <span className="text-[#26A69A]">
                  резерв {initialLayout.reserveModules}
                </span>
              </p>
            </div>
          </div>

{/* Корпус */}
<div className="bg-gradient-to-br from-[#eceff1] to-[#cfd8dc] border-4 border-[#90a4ae] rounded-lg p-6 shadow-2xl">
  {/* Верхние крепёжные винты */}
  <div className="flex justify-between mb-3">
    <div className="w-3 h-3 rounded-full bg-[#78909c] border border-[#37474f]" />
    <div className="w-3 h-3 rounded-full bg-[#78909c] border border-[#37474f]" />
  </div>
  
  {/* Имитация шины PE (зелёная) сверху */}
  <div className="mb-4 flex items-center gap-2 p-2 bg-[#fff9c4] border-2 border-[#f9a825] rounded-sm">
    <div className="text-xs font-mono text-[#827717] font-bold">PE</div>
    <div className="flex-1 h-2 bg-gradient-to-r from-[#ffeb3b] via-[#fbc02d] to-[#ffeb3b] rounded-sm relative">
      {/* Клеммы на шине */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#8d6e63] rounded-full"
          style={{ left: `${(i + 1) * 5}%` }}
        />
      ))}
    </div>
  </div>

  {/* Шина N (синяя) */}
  <div className="mb-4 flex items-center gap-2 p-2 bg-[#e3f2fd] border-2 border-[#1976d2] rounded-sm">
    <div className="text-xs font-mono text-[#0d47a1] font-bold">N</div>
    <div className="flex-1 h-2 bg-gradient-to-r from-[#90caf9] via-[#42a5f5] to-[#90caf9] rounded-sm relative">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#8d6e63] rounded-full"
          style={{ left: `${(i + 1) * 5}%` }}
        />
      ))}
    </div>
  </div>

  {/* Модули */}
  {rails.map((railItems, idx) => (
    <DinRail
      key={idx}
      items={railItems as any}
      railIndex={idx}
      modulesPerRail={initialLayout.recommendedEnclosure.modulesPerRail}
    />
  ))}

  {/* Нижние крепёжные винты */}
  <div className="flex justify-between mt-3">
    <div className="w-3 h-3 rounded-full bg-[#78909c] border border-[#37474f]" />
    <div className="w-3 h-3 rounded-full bg-[#78909c] border border-[#37474f]" />
  </div>
</div>

          <div className="mt-4 text-xs text-[#787B86] text-center">
            💡 Модули показаны в реальных пропорциях (1 модуль ≈ 17.5 мм)
          </div>
        </CardContent>
      </Card>

      {/* Drag-and-drop список групп */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#D1D4DC] mb-1">
              Состав щита
            </h3>
            <p className="text-sm text-[#787B86]">
              💡 Перетаскивайте линии мышкой, чтобы изменить порядок
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {groups.map((group) => (
                  <SortableGroup key={group.id} group={group} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}

// ───────────────────────────────────────────────
// Компонент одной группы (с drag-handle)
// ───────────────────────────────────────────────
function SortableGroup({ group }: { group: PanelGroup }) {
  const isInput = group.id === "input";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id, disabled: isInput });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalModules = group.items.reduce((s, i) => s + i.modules, 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-[#131722] border border-[#363A45] rounded-md ${
        isInput ? "opacity-80" : "hover:border-[#2962FF]"
      }`}
    >
      {/* Иконка перетаскивания */}
      {!isInput && (
        <button
          className="touch-none text-[#787B86] hover:text-[#D1D4DC] cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Переместить"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}
      {isInput && <div className="w-5 h-5 shrink-0" />}

      {/* Цветовая полоска */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: group.color }}
      />

      {/* Название */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#D1D4DC] truncate">
          {group.title}
        </div>
        <div className="text-xs text-[#787B86]">
          {group.items.length} {group.items.length === 1 ? "модуль" : "модулей"}
          {" · "}
          <span className="font-mono">
            {group.items.map((i) => i.label).join(" + ")}
          </span>
        </div>
      </div>

      {/* Количество модулей */}
      <div className="shrink-0 text-right">
        <div className="text-2xl font-bold text-[#D1D4DC] font-mono">
          {totalModules}
        </div>
        <div className="text-xs text-[#787B86]">мод.</div>
      </div>
    </div>
  );
}
