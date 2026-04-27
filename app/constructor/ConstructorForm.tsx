"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  updateProject,
  type CreateProjectInput,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Zap, Loader2 } from "lucide-react";

const CONSUMER_TYPES = [
  { value: "LIGHT", label: "💡 Свет", defaultPower: 200, defaultName: "Свет" },
  { value: "SOCKET", label: "🔌 Розетки", defaultPower: 3000, defaultName: "Розеточная группа" },
  { value: "COOKTOP", label: "🍳 Варочная панель", defaultPower: 7000, defaultName: "Варочная панель", dedicated: true },
  { value: "OVEN", label: "🔥 Духовой шкаф", defaultPower: 3000, defaultName: "Духовой шкаф", dedicated: true },
  { value: "WATER_HEATER", label: "💧 Бойлер", defaultPower: 2000, defaultName: "Бойлер", dedicated: true },
  { value: "ELECTRIC_BOILER", label: "🌡️ Электрокотёл", defaultPower: 9000, defaultName: "Электрокотёл", dedicated: true },
  { value: "AIR_CONDITIONER", label: "❄️ Кондиционер", defaultPower: 1500, defaultName: "Кондиционер", dedicated: true },
  { value: "REFRIGERATOR", label: "🧊 Холодильник", defaultPower: 300, defaultName: "Холодильник", dedicated: true },
  { value: "WASHING_MACHINE", label: "🚿 Стиралка/ПММ", defaultPower: 2200, defaultName: "Стиральная машина", dedicated: true },
  { value: "EV_CHARGER", label: "🚗 Зарядка ЭМ", defaultPower: 7000, defaultName: "Зарядка электромобиля", dedicated: true },
  { value: "WARM_FLOOR", label: "🏠 Тёплый пол", defaultPower: 1500, defaultName: "Тёплый пол", dedicated: true },
  { value: "WORKSHOP", label: "🛠️ Мастерская", defaultPower: 5000, defaultName: "Мастерская" },
  { value: "OUTDOOR", label: "🌳 Улица", defaultPower: 1000, defaultName: "Уличная линия" },
  { value: "OTHER", label: "🔧 Прочее", defaultPower: 500, defaultName: "Прочее" },
];

type Consumer = {
  id: string;
  type: string;
  name: string;
  power: number;
  quantity: number;
  dedicatedLine: boolean;
};

type Room = {
  id: string;
  name: string;
  area: string;
  consumers: Consumer[];
};

// 🆕 Props — опционально передаём начальные данные для редактирования
export type ConstructorFormProps = {
  mode?: "create" | "edit";
  projectId?: string;
  initialData?: {
    name: string;
    networkType: "SINGLE_PHASE" | "THREE_PHASE";
    rooms: {
      name: string;
      area: number | null;
      consumers: {
        type: string;
        name: string;
        power: number;
        quantity: number;
        dedicatedLine: boolean;
      }[];
    }[];
  };
};

export default function ConstructorForm({
  mode = "create",
  projectId,
  initialData,
}: ConstructorFormProps) {
  const router = useRouter();

  // Инициализация состояния из initialData (для редактирования) или дефолта
  const [projectName, setProjectName] = useState(
    initialData?.name || "Мой проект"
  );
  const [networkType, setNetworkType] = useState<"SINGLE_PHASE" | "THREE_PHASE">(
    initialData?.networkType || "SINGLE_PHASE"
  );
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (initialData?.rooms && initialData.rooms.length > 0) {
      return initialData.rooms.map((room) => ({
        id: crypto.randomUUID(),
        name: room.name,
        area: room.area?.toString() || "",
        consumers: room.consumers.map((c) => ({
          id: crypto.randomUUID(),
          type: c.type,
          name: c.name,
          power: c.power,
          quantity: c.quantity,
          dedicatedLine: c.dedicatedLine,
        })),
      }));
    }
    return [
      {
        id: crypto.randomUUID(),
        name: "Кухня",
        area: "12",
        consumers: [],
      },
    ];
  });

  const [isPending, startTransition] = useTransition();

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        id: crypto.randomUUID(),
        name: `Комната ${rooms.length + 1}`,
        area: "",
        consumers: [],
      },
    ]);
  };

  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const updateRoom = (roomId: string, field: "name" | "area", value: string) => {
    setRooms(rooms.map((r) => (r.id === roomId ? { ...r, [field]: value } : r)));
  };

  const addConsumer = (roomId: string) => {
    const defaultType = CONSUMER_TYPES[0];
    setRooms(
      rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              consumers: [
                ...r.consumers,
                {
                  id: crypto.randomUUID(),
                  type: defaultType.value,
                  name: defaultType.defaultName,
                  power: defaultType.defaultPower,
                  quantity: 1,
                  dedicatedLine: defaultType.dedicated || false,
                },
              ],
            }
          : r
      )
    );
  };

  const removeConsumer = (roomId: string, consumerId: string) => {
    setRooms(
      rooms.map((r) =>
        r.id === roomId
          ? { ...r, consumers: r.consumers.filter((c) => c.id !== consumerId) }
          : r
      )
    );
  };

  const updateConsumer = (
    roomId: string,
    consumerId: string,
    updates: Partial<Consumer>
  ) => {
    setRooms(
      rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              consumers: r.consumers.map((c) =>
                c.id === consumerId ? { ...c, ...updates } : c
              ),
            }
          : r
      )
    );
  };

  const totalPower = rooms.reduce(
    (sum, room) =>
      sum + room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      alert("Введите название проекта");
      return;
    }
    if (rooms.length === 0) {
      alert("Добавьте хотя бы одну комнату");
      return;
    }
    if (rooms.some((r) => r.consumers.length === 0)) {
      alert("В каждой комнате должен быть хотя бы один потребитель");
      return;
    }

    const input: CreateProjectInput = {
      name: projectName.trim(),
      networkType,
      rooms: rooms.map((r) => ({
        name: r.name,
        area: r.area ? parseFloat(r.area) : undefined,
        consumers: r.consumers.map((c) => ({
          type: c.type as CreateProjectInput["rooms"][0]["consumers"][0]["type"],
          name: c.name,
          power: c.power,
          quantity: c.quantity,
          dedicatedLine: c.dedicatedLine,
        })),
      })),
    };

    startTransition(async () => {
      try {
        let result;
        if (mode === "edit" && projectId) {
          result = await updateProject(projectId, input);
        } else {
          result = await createProject(input);
        }

        if (result?.success && result.projectId) {
          // 🚀 Редирект на клиенте — без NEXT_REDIRECT ошибки
          router.push(`/projects/${result.projectId}`);
          router.refresh();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        alert("Ошибка: " + message);
        console.error(error);
      }
    });
  };

  const isEditMode = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Общая информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectName">Название проекта</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Например: Квартира на Ленина 42"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="networkType">Тип сети</Label>
            <Select
              value={networkType}
              onValueChange={(v) => setNetworkType(v as typeof networkType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_PHASE">
                  Однофазная 220В (квартира)
                </SelectItem>
                <SelectItem value="THREE_PHASE">
                  Трёхфазная 380В (дом, мощные приборы)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rooms.map((room, roomIdx) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Название</Label>
                    <Input
                      value={room.name}
                      onChange={(e) =>
                        updateRoom(room.id, "name", e.target.value)
                      }
                      placeholder="Кухня, спальня..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Площадь, м²</Label>
                    <Input
                      type="number"
                      value={room.area}
                      onChange={(e) =>
                        updateRoom(room.id, "area", e.target.value)
                      }
                      placeholder="12"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeRoom(room.id)}
                  disabled={rooms.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {room.consumers.length === 0 && (
                <div className="text-center py-6 text-[#787B86] text-sm">
                  Нет потребителей. Добавьте — например, свет или розетки
                </div>
              )}

              {room.consumers.map((consumer) => (
                <div
                  key={consumer.id}
                  className="grid grid-cols-[1fr_1fr_120px_80px_40px] gap-2 items-end"
                >
                  <div>
                    <Label className="text-xs">Тип</Label>
                    <Select
                      value={consumer.type}
                      onValueChange={(v) => {
                        const type = CONSUMER_TYPES.find((t) => t.value === v)!;
                        updateConsumer(room.id, consumer.id, {
                          type: v,
                          name: type.defaultName,
                          power: type.defaultPower,
                          dedicatedLine: type.dedicated || false,
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONSUMER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Название</Label>
                    <Input
                      value={consumer.name}
                      onChange={(e) =>
                        updateConsumer(room.id, consumer.id, {
                          name: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Мощность, Вт</Label>
                    <Input
                      type="number"
                      value={consumer.power}
                      onChange={(e) =>
                        updateConsumer(room.id, consumer.id, {
                          power: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Кол-во</Label>
                    <Input
                      type="number"
                      value={consumer.quantity}
                      min={1}
                      onChange={(e) =>
                        updateConsumer(room.id, consumer.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeConsumer(room.id, consumer.id)}
                    className="text-[#EF5350] hover:text-[#EF5350] hover:bg-[#EF5350]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => addConsumer(room.id)}
                className="w-full mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить потребителя
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addRoom}
          className="w-full h-14 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить комнату
        </Button>
      </div>

      <Card className="bg-[#2962FF]/10 border-[#2962FF]/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-[#787B86]">Общая мощность</div>
              <div className="text-3xl font-bold text-[#D1D4DC]">
                <Zap className="w-8 h-8 inline text-[#FF9800]" />{" "}
                {(totalPower / 1000).toFixed(2)} кВт
              </div>
              <div className="text-xs text-[#787B86] mt-1">
                {rooms.length} комнат ·{" "}
                {rooms.reduce((s, r) => s + r.consumers.length, 0)}{" "}
                потребителей
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="bg-[#2962FF] hover:bg-[#1E53E5]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Сохраняем изменения..." : "Сохраняем..."}
                </>
              ) : (
                <>{isEditMode ? "💾 Сохранить изменения" : "💾 Создать проект"}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditMode && (
        <div className="text-center text-sm text-[#FF9800] bg-[#FF9800]/10 border border-[#FF9800]/30 rounded-md p-3">
          ⚠️ При сохранении изменений расчёт щита будет сброшен. После сохранения нужно будет пересчитать.
        </div>
      )}
    </form>
  );
}
