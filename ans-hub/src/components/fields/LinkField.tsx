import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFrappePostCall } from "frappe-react-sdk";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

interface AutoCompleteOption {
  label: string;
  value: string;
  description?: string;
  extra?: any;
}

interface LinkFieldProps {
  doctype: string;
  value?: string;
  onChange: (value: string, option?: AutoCompleteOption) => void;
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
}

export const LinkField = ({
  doctype,
  value = "",
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
}: LinkFieldProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [options, setOptions] = React.useState<AutoCompleteOption[]>([]);
  const [selected, setSelected] = React.useState<AutoCompleteOption | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [dropdownPosition, setDropdownPosition] = React.useState<
    "top" | "bottom"
  >("bottom");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const lastSearchRef = React.useRef("");

  const { call } = useFrappePostCall("frappe.desk.search.search_link");

  const calculatePosition = React.useCallback(() => {
    if (!buttonRef.current || !open) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownMaxHeight = 320;
    const buffer = 6;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const newPosition =
      spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow
        ? "top"
        : "bottom";
    setDropdownPosition(newPosition);

    if (dropdownRef.current) {
      if (newPosition === "bottom") {
        dropdownRef.current.style.top = `${rect.bottom + buffer}px`;
        dropdownRef.current.style.bottom = "auto";
      } else {
        dropdownRef.current.style.bottom = `${viewportHeight - rect.top + buffer}px`;
        dropdownRef.current.style.top = "auto";
      }
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.width = `${rect.width}px`;
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
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
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOptions = React.useCallback(
    async (txt: string) => {
      try {
        setLoading(true);
        const res = await call({
          txt,
          doctype,
          page_length: pageLength,
          filters,
          ignore_user_permissions: 0,
        });

        const mapped: AutoCompleteOption[] = (res?.message || []).map(
          (item: any) => ({
            label: item.label || item.value,
            value: item.value,
            description: item.description || "",
            extra: item,
          }),
        );

        setOptions(mapped);

        if (value && !selected) {
          const found = mapped.find((x) => x.value === value);
          if (found) setSelected(found);
        }
      } finally {
        setLoading(false);
      }
    },
    [call, doctype, filters, pageLength, value, selected],
  );

  React.useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebouncedSearch("");
    setHighlightedIndex(0);
    fetchOptions("");
  }, [open, fetchOptions]);

  React.useEffect(() => {
    if (!open || !debouncedSearch || debouncedSearch === lastSearchRef.current)
      return;
    lastSearchRef.current = debouncedSearch;
    fetchOptions(debouncedSearch);
  }, [debouncedSearch, open, fetchOptions]);

  React.useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    if (selected?.value !== value) {
      setSelected({ label: value, value });
    }
  }, [value]);

  const handleSelect = (opt: AutoCompleteOption) => {
    setSelected(opt);
    onChange(opt.value, opt);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange("", undefined);
  };

  const dropdown =
    open && buttonRef.current
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              zIndex: 9999,
              left: buttonRef.current.getBoundingClientRect().left,
              width: buttonRef.current.getBoundingClientRect().width,
            }}
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
                placeholder={`Search ${doctype}...`}
                className={cn(
                  "h-12 w-full bg-transparent text-sm outline-none",
                  inputClassName,
                )}
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : options.length ? (
                options.map((opt, idx) => (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all",
                      idx === highlightedIndex
                        ? "bg-gray-100"
                        : "hover:bg-gray-50",
                      optionClassName,
                      idx === highlightedIndex && activeOptionClassName,
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 text-green-600 mt-0.5",
                        value === opt.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{opt.label}</div>
                      {opt.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center text-sm text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div
        className={cn(
          "mb-2 flex items-center gap-1 text-sm font-bold text-gray-800",
          labelClassName,
        )}
      >
        {label || doctype}
        {required && (
          <span className={cn("text-red-500", requiredClassName)}>*</span>
        )}
      </div>

      <Button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-14 w-full justify-between rounded-2xl border bg-gray-50 px-5 text-left font-normal text-gray-900 transition-all",
          open && "border-dash-red ring-4 ring-dash-red/10 bg-white",
          buttonClassName,
        )}
      >
        <span className={cn("truncate text-sm", !selected && "text-gray-400")}>
          {selected?.label ||
            value ||
            placeholder ||
            `Select ${label || doctype}`}
        </span>

        <div className="ml-2 flex items-center gap-2">
          {value && (
            <div
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </div>
          )}
          <ChevronsUpDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </Button>

      {dropdown}
    </div>
  );
};
