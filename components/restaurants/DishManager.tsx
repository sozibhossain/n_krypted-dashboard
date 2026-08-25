"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { DishItem, DishPayload, getApiErrorMessage, RestaurantItem, restaurantApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emptyDish: DishPayload = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  isSignatureDish: false,
  isActive: true,
};

export function DishManager({ restaurant }: { restaurant: RestaurantItem }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<DishItem | null>(null);
  const [form, setForm] = useState<DishPayload>(emptyDish);
  const [showForm, setShowForm] = useState(false);

  const refresh = (updated: RestaurantItem) => {
    queryClient.setQueryData(["restaurant-detail", restaurant._id], updated);
    queryClient.setQueryData(["my-restaurant"], updated);
    toast.success(editing ? "Gericht aktualisiert" : "Gericht hinzugefügt");
    setEditing(null);
    setForm(emptyDish);
    setShowForm(false);
  };
  const saveMutation = useMutation({
    mutationFn: (payload: DishPayload) =>
      editing
        ? restaurantApi.updateDish(restaurant._id, editing._id, payload)
        : restaurantApi.addDish(restaurant._id, payload),
    onSuccess: refresh,
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Gericht konnte nicht gespeichert werden")),
  });
  const deleteMutation = useMutation({
    mutationFn: (dishId: string) => restaurantApi.deleteDish(restaurant._id, dishId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["restaurant-detail", restaurant._id], updated);
      queryClient.setQueryData(["my-restaurant"], updated);
      toast.success("Gericht gelöscht");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Gericht konnte nicht gelöscht werden")),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate(form);
  };
  const edit = (dish: DishItem) => {
    setEditing(dish);
    setForm({ ...dish });
    setShowForm(true);
  };

  return (
    <section className="space-y-4 border-t border-[#F5F2E8] pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1E1E1E]">Gerichte</h3>
          <p className="text-xs text-[#718096]">Signature Dishes und weitere Gerichte verwalten.</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setForm(emptyDish);
            setShowForm(true);
          }}
        >
          <span className="inline-flex items-center">
            <Plus className="mr-1 h-4 w-4" />
            <span>Gericht hinzufügen</span>
          </span>
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[#FEEFB3] bg-[#FFFBE9] p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#334155]">
            <span>Gerichtname</span>
            <Input required placeholder="z. B. Signature Truffel Pasta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#334155]">
            <span>Preis (€)</span>
            <Input required min="0" step="0.01" type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#334155]">
            <span>Kategorie</span>
            <Input placeholder="z. B. Hauptspeise, Vorspeise" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#334155]">
            <span>Bild-URL</span>
            <Input type="url" placeholder="https://images.unsplash.com/..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#334155] sm:col-span-2">
            <span>Beschreibung</span>
            <textarea className="min-h-24 w-full rounded-xl border border-[#90CAF9] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#0097A7]" placeholder="Beschreibung des Gerichts..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" checked={form.isSignatureDish} onChange={(e) => setForm({ ...form, isSignatureDish: e.target.checked })} className="h-4 w-4 accent-[#0097A7]" />
            <span>Signature Dish (Besondere Spezialität)</span>
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              <span className="inline-flex items-center">
                <X className="mr-1 h-4 w-4" />
                <span>Abbrechen</span>
              </span>
            </Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              <span>{editing ? "Speichern" : "Hinzufügen"}</span>
            </Button>
          </div>
        </form>
      )}

      {restaurant.dishes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-sm text-[#718096]">
          <ChefHat className="mx-auto mb-2 h-8 w-8" />Noch keine Gerichte vorhanden.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurant.dishes.map((dish) => (
            <article key={dish._id} className="rounded-2xl border border-[#F0ECE1] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5"><h4 className="font-bold">{dish.name}</h4>{dish.isSignatureDish && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}</div>
                  <p className="mt-1 text-xs text-[#718096]">{dish.category || "Ohne Kategorie"}</p>
                </div>
                <span className="font-bold text-[#0097A7]">€{dish.price.toFixed(2)}</span>
              </div>
              {dish.description && <p className="mt-3 line-clamp-2 text-xs text-[#4A5568]">{dish.description}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => edit(dish)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (window.confirm("Gericht löschen?")) deleteMutation.mutate(dish._id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
