import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

interface AutoCompleteOption {
  label: string;
  value: string;
  description?: string;
  extra?: any;
}

interface MultiSelectLinkFieldProps {
  doctype: string;
  targetDoctype?: string; // Optional: directly specify the target doctype to search
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
}: MultiSelectLinkFieldProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [options, setOptions] = React.useState<AutoCompleteOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [targetDoctype, setTargetDoctype] = React.useState<string | null>(
    providedTargetDoctype || null
  );
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [dropdownPosition, setDropdownPosition] = React.useState<
    "top" | "bottom"
  >("bottom");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: metaData, isLoading: loadingMeta } = useFrappeGetCall(
    "frappe.client.get_value",
    {
      doctype: "DocField",
      filters: {
        parent: parentDoctype,
        fieldtype: "Link",
      },
      fieldname: "options",
    },
    // Skip fetching metadata if targetDoctype is already provided
    { skip: !!providedTargetDoctype }
  );

  const { call: searchLink } = useFrappePostCall(
    "frappe.desk.search.search_link",
  );

  React.useEffect(() => {
    if (!providedTargetDoctype && metaData?.message?.options) {
      setTargetDoctype(metaData.message.options);
    }
  }, [metaData, providedTargetDoctype]);

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
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOptions = React.useCallback(
    async (txt: string) => {
      if (!targetDoctype) return;
      try {
        setLoading(true);
        const res = await searchLink({
          txt,
          doctype: targetDoctype,
          page_length: pageLength,
          filters,
        });
        const mapped = (res?.message || []).map((item: any) => ({
          label: item.label || item.value,
          value: item.value,
          description: item.description || "",
          extra: item,
        }));
        setOptions(mapped);
      } finally {
        setLoading(false);
      }
    },
    [searchLink, targetDoctype, filters, pageLength],
  );

  React.useEffect(() => {
    if (open && targetDoctype) fetchOptions(debouncedSearch);
  }, [open, debouncedSearch, targetDoctype, fetchOptions]);

  const toggleOption = (val: string) => {
    const newValues = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newValues);
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
                placeholder={`Search ${targetDoctype || "..."} `}
                className={cn(
                  "h-12 w-full bg-transparent text-sm outline-none",
                  inputClassName,
                )}
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {loading || loadingMeta ? (
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
                      toggleOption(opt.value);
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
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 mt-0.5",
                        value.includes(opt.value)
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white",
                      )}
                    >
                      {value.includes(opt.value) && (
                        <Check className="h-3 w-3 stroke-[4]" />
                      )}
                    </div>
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
        {label || parentDoctype}
        {required && (
          <span className={cn("text-red-500", requiredClassName)}>*</span>
        )}
      </div>
      <Button
        ref={buttonRef}
        type="button"
        disabled={disabled || loadingMeta}
        onClick={() => setOpen((o) => !o)}
        style={{
          minHeight: "56px",
          maxHeight: "300px",
        }}
        className={cn(
          "h-auto overflow-y-auto w-full justify-between rounded-2xl border bg-gray-50 px-4 py-3 text-left font-normal text-gray-900 transition-all",
          open && "border-dash-red ring-4 ring-dash-red/10 bg-white",
          buttonClassName,
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 pr-2">
          {value.length > 0 ? (
            value.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                {v}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((item) => item !== v));
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">
              {placeholder || `Select items`}
            </span>
          )}
        </div>
        <ChevronsUpDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform self-start mt-1",
            open && "rotate-180",
          )}
        />
      </Button>
      {dropdown}
    </div>
  );
};
