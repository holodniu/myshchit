"use client";

import { useState, useEffect, useMemo } from "react";
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
import Busbar from "./Busbar";
import {
  buildPanelLayout,
  distributeOnRails,
  type PanelGroup,
} from "@/lib/calculator/panel-layout";
import type { CalculationResult } from "@/lib/calculator/calculator";
import { Card, CardContent } from "@/components/ui/card";
import { Package, GripVertical } from "lucide-react";

export default function PanelVisualization({
  result,
  brand = "abb",
}: {
  result: CalculationResult;
  brand?: string;
}) {
  // Пересчитываем layout при смене бренда
  const layout = useMemo(
    () => buildPanelLayout(result, brand),
    [result, brand]
  );

  const [groups, setGroups] = useState<PanelGroup[]>(layout.groups);

  // Обновляем groups при изменении бренда или result
  useEffect(() => {
    setGroups(layout.groups);
  }, [layout]);

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
    if (active.id === "input" || over.id === "input") return;

    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setGroups(arrayMove(groups, oldIndex, newIndex));
    }
  };

  const allItems = groups.flatMap((g) => g.items);
  const rails = distributeOnRails(
    allItems,
    layout.recommendedEnclosure.modulesPerRail
  );

  // Кол-во клемм на шинах = модулей на рейке × 2 (запас)
  const busbarTerminals = Math.max(16, layout.recommendedEnclosure.modulesPerRail * 2);

  return (
    <div className="space-y-6">
      {/* 🏗 Визуализация щита */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-bold text-[#D1D4DC] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Схема щита
              </h3>
              <p className="text-sm text-[#787B86]">
                Корпус: {layout.recommendedEnclosure.name} · Бренд:{" "}
                <span className="text-[#2962FF] font-semibold">{layout.brand}</span> ·{" "}
                {layout.totalModules} из {layout.recommendedEnclosure.modules} модулей ·{" "}
                <span className="text-[#26A69A]">
                  резерв {layout.reserveModules}
                </span>
              </p>
            </div>
          </div>

          {/* 📦 Корпус щита */}
          <div className="bg-gradient-to-br from-[#eceff1] to-[#cfd8dc] border-4 border-[#90a4ae] rounded-lg p-6 shadow-2xl">
            {/* Верхние крепёжные винты корпуса */}
            <div className="flex justify-between mb-4">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#b0bec5] to-[#546e7a] border border-[#263238] shadow-inner">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-px bg-[#263238]" />
                </div>
              </div>
              <div className="text-xs font-mono text-[#455a64] font-bold">
                {layout.recommendedEnclosure.name}
              </div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#b0bec5] to-[#546e7a] border border-[#263238] shadow-inner">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-px bg-[#263238]" />
                </div>
              </div>
            </div>

            {/* 🟡 Верхние шины */}
            <div className="mb-5 space-y-2">
              <Busbar type="PE" label="PE" terminals={busbarTerminals} />
              <Busbar type="N" label="N" terminals={busbarTerminals} />
            </div>

            {/* ⚡ DIN-рейки с модулями */}
            {rails.map((railItems, idx) => (
              <DinRail
                key={idx}
                items={railItems as any}
                railIndex={idx}
                modulesPerRail={layout.recommendedEnclosure.modulesPerRail}
              />
            ))}

            {/* 🟡 Нижние шины */}
            <div className="mt-5 space-y-2">
              <Busbar type="N" label="N" terminals={busbarTerminals} />
              <Busbar type="PE" label="PE" terminals={busbarTerminals} />
            </div>

            {/* Нижние крепёжные винты */}
            <div className="flex justify-between mt-4">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#b0bec5] to-[#546e7a] border border-[#263238] shadow-inner" />
              <div className="text-xs text-[#546e7a]">
                🛡️ МОЙ ЩИТ · Автоматический расчёт
              </div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#b0bec5] to-[#546e7a] border border-[#263238] shadow-inner" />
            </div>
          </div>

          <div className="mt-4 text-xs text-[#787B86] text-center">
            💡 1 модуль ≈ 17.5 мм · Все модули одного бренда{" "}
            <span className="text-[#2962FF] font-semibold">{layout.brand}</span>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Drag-and-drop список групп */}
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

      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: group.color }}
      />

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

      <div className="shrink-0 text-right">
        <div className="text-2xl font-bold text-[#D1D4DC] font-mono">
          {totalModules}
        </div>
        <div className="text-xs text-[#787B86]">мод.</div>
      </div>
    </div>
  );
}

