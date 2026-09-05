import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Plus, Search, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

interface AutoCompleteOption {
  label: string;
  value: string;
  description?: string;
}

interface QuickAddField {
  fieldname: string;
  label: string;
  required?: boolean;
}

interface MultiSelectLinkFieldProps {
  doctype: string;
  targetDoctype?: string;
  value?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
  labelClassName?: string;
  requiredClassName?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  inputClassName?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  filters?: Record<string, any>;
  pageLength?: number;
  quickAdd?: QuickAddField[];
}

export const MultiSelectLinkField = ({
  doctype: parentDoctype,
  targetDoctype: providedTargetDoctype,
  value = [],
  onChange,
  placeholder,
  disabled,
  required,
  label,
  className,
  labelClassName,
  requiredClassName,
  buttonClassName,
  dropdownClassName,
  inputClassName,
  optionClassName,
  activeOptionClassName,
  filters,
  pageLength = 20,
  quickAdd,
}: MultiSelectLinkFieldProps) => {
  const searchDoctype = providedTargetDoctype || parentDoctype;

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchTxt, setSearchTxt] = React.useState("");
  const [options, setOptions] = React.useState<AutoCompleteOption[]>([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [dropdownPosition, setDropdownPosition] = React.useState<"top" | "bottom">("bottom");
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [quickAddValues, setQuickAddValues] = React.useState<Record<string, string>>({});
  const [quickAddSaving, setQuickAddSaving] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchOptions = React.useCallback(async (txt: string) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        fields: JSON.stringify(["name"]),
        limit_page_length: String(pageLength),
        order_by: "name asc",
      });
      if (txt) params.set("filters", JSON.stringify([["name", "like", `%${txt}%`]]));
      if (filters && Object.keys(filters).length) {
        const extra = Object.entries(filters).map(([k, v]) => [k, "=", v]);
        const existing = txt ? JSON.parse(params.get("filters")!) : [];
        params.set("filters", JSON.stringify([...existing, ...extra]));
      }
      const res = await fetch(`/api/resource/${encodeURIComponent(searchDoctype)}?${params}`);
      const json = await res.json();
      setOptions((json.data || []).map((item: any) => ({ label: item.name, value: item.name, description: "" })));
    } finally {
      setListLoading(false);
    }
  }, [searchDoctype, filters, pageLength]);

  const calculatePosition = React.useCallback(() => {
    if (!buttonRef.current || !open) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const newPosition = spaceBelow < 320 && spaceAbove > spaceBelow ? "top" : "bottom";
    setDropdownPosition(newPosition);
    if (dropdownRef.current) {
      if (newPosition === "bottom") {
        dropdownRef.current.style.top = `${rect.bottom + 6}px`;
        dropdownRef.current.style.bottom = "auto";
      } else {
        dropdownRef.current.style.bottom = `${viewportHeight - rect.top + 6}px`;
        dropdownRef.current.style.top = "auto";
      }
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.width = `${rect.width}px`;
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [open, calculatePosition]);

  React.useEffect(() => {
    if (!open) return;
    setSearch("");
    setSearchTxt("");
    setHighlightedIndex(0);
    fetchOptions("");
  }, [open]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearchTxt(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    if (!open) return;
    fetchOptions(searchTxt);
  }, [searchTxt]);

  const toggleOption = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdd) return;
    setQuickAddSaving(true);
    try {
      const doc: Record<string, any> = { doctype: searchDoctype };
      quickAdd.forEach((f) => { doc[f.fieldname] = quickAddValues[f.fieldname] || ""; });
      const res = await fetch("/api/resource/" + encodeURIComponent(searchDoctype), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Frappe-CSRF-Token": (window as any).csrf_token || "fetch" },
        body: JSON.stringify(doc),
      });
      const json = await res.json();
      const newName = json.data?.name;
      if (newName) {
        setOptions((prev) => [{ label: newName, value: newName, description: "" }, ...prev]);
        onChange([...value, newName]);
        setShowQuickAdd(false);
        setQuickAddValues({});
      }
    } finally {
      setQuickAddSaving(false);
    }
  };

  const dropdown =
    open && buttonRef.current
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", zIndex: 9999 }}
            className={cn(
              "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200",
              dropdownClassName,
            )}
          >
            <div className="flex items-center border-b px-4">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${searchDoctype}...`}
                className={cn("h-12 w-full bg-transparent text-sm outline-none", inputClassName)}
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {listLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : options.length ? (
                options.map((opt, idx) => (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); toggleOption(opt.value); }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all",
                      idx === highlightedIndex ? "bg-gray-100" : "hover:bg-gray-50",
                      optionClassName,
                      idx === highlightedIndex && activeOptionClassName,
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 mt-0.5",
                      value.includes(opt.value) ? "bg-red-500 border-red-500 text-white" : "bg-white",
                    )}>
                      {value.includes(opt.value) && <Check className="h-3 w-3 stroke-[4]" />}
                    </div>
                    <div className="text-sm font-semibold">{opt.label}</div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center text-sm text-gray-500">No results found</div>
              )}
            </div>
            {quickAdd && (
              <div className="border-t border-gray-100 p-2">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setOpen(false); setShowQuickAdd(true); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-dash-red hover:bg-dash-red/5 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add new {label || searchDoctype}
                </button>
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  const quickAddModal = showQuickAdd && quickAdd
    ? createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Add new {label || searchDoctype}</h2>
            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              {quickAdd.map((f) => (
                <div key={f.fieldname}>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    required={f.required}
                    value={quickAddValues[f.fieldname] || ""}
                    onChange={(e) => setQuickAddValues((prev) => ({ ...prev, [f.fieldname]: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowQuickAdd(false); setQuickAddValues({}); }}
                  className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickAddSaving}
                  className="flex-1 h-11 rounded-xl bg-dash-red text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {quickAddSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className={cn("mb-2 flex items-center gap-1 text-sm font-bold text-gray-800", labelClassName)}>
        {label || parentDoctype}
        {required && <span className={cn("text-red-500", requiredClassName)}>*</span>}
      </div>
      <Button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{ minHeight: "56px", maxHeight: "300px" }}
        className={cn(
          "h-auto overflow-y-auto w-full justify-between rounded-2xl border bg-gray-50 px-4 py-3 text-left font-normal text-gray-900 transition-all",
          open && "border-dash-red ring-4 ring-dash-red/10 bg-white",
          buttonClassName,
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 pr-2">
          {value.length > 0 ? (
            value.map((v) => (
              <span key={v} className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300">
                {v}
                <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={(e) => { e.stopPropagation(); onChange(value.filter((item) => item !== v)); }} />
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">{placeholder || "Select items"}</span>
          )}
        </div>
        <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform self-start mt-1", open && "rotate-180")} />
      </Button>
      {dropdown}
      {quickAddModal}
    </div>
  );
};
