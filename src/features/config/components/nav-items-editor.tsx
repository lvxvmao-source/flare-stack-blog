import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { SystemConfig } from "@/features/config/config.schema";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

function createEmptyItem() {
  const id = crypto.randomUUID();
  return {
    id,
    label: { zh: "", en: "" },
    type: "internal" as const,
    to: `/nav/${id}`,
    openInNewTab: false,
  };
}

export function NavItemsEditor() {
  const { control, register, watch } = useFormContext<SystemConfig>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "site.navItems",
  });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = (dropIndex: number) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      move(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-background/30 py-10 text-center">
        <p className="text-sm text-muted-foreground">{m.settings_nav_empty()}</p>
        <button
          type="button"
          onClick={() => append(createEmptyItem())}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus size={16} />
          {m.settings_nav_add()}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const type = watch(`site.navItems.${index}.type`);
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;
        return (
          <div
            key={field.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
            className={cn(
              "flex flex-col gap-3 border border-border/30 rounded-lg bg-background/30 p-4 transition-all duration-200",
              isDragging && "opacity-50",
              isOver && "ring-2 ring-foreground/20 bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground active:cursor-grabbing"
                aria-label={m.settings_nav_drag_hint()}
              >
                <GripVertical size={16} />
              </button>

              <span className="min-w-0 flex-1 text-xs uppercase tracking-widest text-muted-foreground/60">
                {m.settings_nav_drag_hint()}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={m.settings_nav_move_up()}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    move(index, Math.min(fields.length - 1, index + 1))
                  }
                  disabled={index === fields.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={m.settings_nav_move_down()}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={m.settings_nav_delete()}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Name: Chinese / English */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_label_zh()}
                </label>
                <Input
                  {...register(`site.navItems.${index}.label.zh`)}
                  placeholder={m.settings_nav_label_zh_ph()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_label_en()}
                </label>
                <Input
                  {...register(`site.navItems.${index}.label.en`)}
                  placeholder={m.settings_nav_label_en_ph()}
                />
              </div>
            </div>

            {/* Description: Chinese / English */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_description_zh()}
                </label>
                <Input
                  {...register(`site.navItems.${index}.description.zh`)}
                  placeholder={m.settings_nav_description_zh_ph()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_description_en()}
                </label>
                <Input
                  {...register(`site.navItems.${index}.description.en`)}
                  placeholder={m.settings_nav_description_en_ph()}
                />
              </div>
            </div>

            {/* Type selector + URL */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="w-full shrink-0 space-y-1.5 sm:w-40">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_type()}
                </label>
                <select
                  {...register(`site.navItems.${index}.type`)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="internal">
                    {m.settings_nav_type_internal()}
                  </option>
                  <option value="external">
                    {m.settings_nav_type_external()}
                  </option>
                </select>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {m.settings_nav_url()}
                </label>
                <Input
                  {...register(`site.navItems.${index}.to`)}
                  placeholder={
                    type === "internal"
                      ? m.settings_nav_url_ph_internal()
                      : m.settings_nav_url_ph_external()
                  }
                />
              </div>
            </div>

            {type === "external" && (
              <div className="flex items-center gap-2 pt-1">
                <Controller
                  control={control}
                  name={`site.navItems.${index}.openInNewTab`}
                  render={({ field }) => (
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(v)}
                    />
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {m.settings_nav_newtab()}
                </span>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append(createEmptyItem())}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus size={16} />
        {m.settings_nav_add()}
      </button>
    </div>
  );
}
