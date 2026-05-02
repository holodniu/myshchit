"use client";

import { useState, useEffect } from "react";
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

import PanelSpecification from "./PanelSpecification";
import {
  buildPanelLayout,
  type PanelGroup,
} from "@/lib/calculator/panel-layout";
import type { CalculationResult } from "@/lib/calculator/calculator";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, List } from "lucide-react";

export default function PanelVisualization({
  result,
  brand = "abb",
}: {
  result: CalculationResult;
  brand?: string;
}) {
  const layout = buildPanelLayout(result, brand);

  const [groups, setGroups] = useState<PanelGroup[]>(layout.groups);

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

  return (
    <div className="space-y-6">
      {/* 📊 Инфо о щите */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <List className="w-5 h-5 text-[#2962FF]" />
            <h3 className="text-xl font-bold text-[#D1D4DC]">
              Состав щита
            </h3>
          </div>
          <p className="text-sm text-[#787B86]">
            Корпус: {layout.recommendedEnclosure.name} · Бренд:{" "}
            <span className="text-[#2962FF] font-semibold">
              {layout.brand}
            </span>{" "}
            · {layout.totalModules} из {layout.recommendedEnclosure.modules}{" "}
            модулей ·{" "}
            <span className="text-[#26A69A]">
              резерв {layout.reserveModules}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* 📋 Спецификация */}
      <PanelSpecification groups={groups} />

      {/* 📋 Состав щита (drag-and-drop список) */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#D1D4DC] mb-1">
              Состав щита (по линиям)
            </h3>
            <p className="text-sm text-[#787B86]">
              💡 Перетаскивайте линии мышкой, чтобы изменить порядок в списке
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
