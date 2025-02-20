import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a product name, id, and an optional isChecked flag.
   */
  options: {
    /** The product name to display for the option. */
    productName: string;
    /** The unique identifier associated with the option. */
    id: string;
    /** Boolean flag to indicate if the option is checked. */
    isChecked: boolean;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /**
   * The current selected values.
   * If provided, this will override the internal state of the component.
   */
  value?: string[];

  /**
   * The default selected values when the component mounts.
   * If `value` is not provided, this will be used to initialize the internal state.
   */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * Callback function triggered when the popover opens.
   * Optional, can be used to perform actions when the popover opens.
   */
  onOpen?: () => Promise<void> | void;

  /**
   * If true, the component will display a loading state.
   * Optional, defaults to false.
   */
  loading?: boolean;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      className,
      variant,
      options,
      onValueChange,
      value,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      onOpen,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value || defaultValue
    );

    // Update internal state when value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
      }
    }, [value]);

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const handleToggleOption = (id: string) => {
      const newSelectedValues = selectedValues.includes(id)
        ? selectedValues.filter((v) => v !== id)
        : [...selectedValues, id];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);

      // Update isChecked in options
      options.forEach((option) => {
        if (option.id === id) {
          option.isChecked = !option.isChecked;
        }
      });
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);

      // Update all options to unchecked
      options.forEach((option) => {
        option.isChecked = false;
      });
    };

    const handleToggleAll = () => {
      const allChecked = options.every((option) => option.isChecked);
      if (allChecked) {
        handleClear();
      } else {
        const allIds = options.map((option) => option.id);
        setSelectedValues(allIds);
        onValueChange(allIds);

        // Update all options to checked
        options.forEach((option) => {
          option.isChecked = true;
        });
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open) => {
          if (open && onOpen) {
            onOpen();
          }
          setIsPopoverOpen(open);
        }}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className={cn("w-full justify-between", className)}
            {...props}
          >
            <div className="flex gap-1 flex-wrap">
              {selectedValues.length > 0 ? (
                <>
                  {selectedValues.slice(0, maxCount).map((id) => {
                    const option = options.find((o) => o.id === id);
                    return option ? (
                      <Badge
                        key={id}
                        className={cn(
                          multiSelectVariants({ variant }),
                          "mr-1 mb-1"
                        )}
                      >
                        {option.productName}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOption(id);
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge variant="secondary" className="mb-1">
                      +{selectedValues.length - maxCount} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 opacity-50 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="flex flex-col h-[300px]">
            <CommandInput placeholder="Search..." className="flex-none" />
            <CommandList className="flex-grow overflow-auto">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={handleToggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      options.every((option) => option.isChecked)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>Select All</span>
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => handleToggleOption(option.id)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        option.isChecked
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{option.productName}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t flex p-2 items-center justify-between flex-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Clear All
              </Button>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPopoverOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
