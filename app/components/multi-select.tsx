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
   * Each option object has a product name, id, and an optional isSelectedForProductBenefit flag.
   */
  options: {
    /** The product name to display for the option. */
    productName: string;
    /** The unique identifier associated with the option. */
    id: string;
    /** Boolean flag to indicate if the option is selected for product benefit. */
    isSelectedForProductBenefit: boolean;
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
      loading = true,
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

      // Update isSelectedForProductBenefit in options
      options.forEach((option) => {
        if (option.id === id) {
          option.isSelectedForProductBenefit =
            !option.isSelectedForProductBenefit;
        }
      });
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);

      // Update all options to unselected
      options.forEach((option) => {
        option.isSelectedForProductBenefit = false;
      });
    };

    const handleToggleAll = () => {
      const allChecked = options.every(
        (option) => option.isSelectedForProductBenefit
      );
      if (allChecked) {
        handleClear();
      } else {
        const allIds = options.map((option) => option.id);
        setSelectedValues(allIds);
        onValueChange(allIds);

        // Update all options to selected
        options.forEach((option) => {
          option.isSelectedForProductBenefit = true;
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
            className={cn(
              "w-full justify-between relative px-3 py-1.5 min-h-[36px] flex items-center",
              className
            )}
            {...props}
          >
            <div className="flex items-center flex-wrap gap-1 pe-8">
              {selectedValues.length > 0 ? (
                <>
                  {selectedValues.slice(0, maxCount).map((id) => {
                    const option = options.find((o) => o.id === id);
                    return option ? (
                      <Badge
                        key={id}
                        className={cn(
                          multiSelectVariants({ variant }),
                          "text-xs inline-flex items-center h-5 px-1.5 py-0"
                        )}
                      >
                        <span className="truncate">{option.productName}</span>
                        <XCircle
                          className="ml-1 h-3 w-3 flex-shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOption(id);
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      variant="secondary"
                      className="text-xs inline-flex items-center h-5 px-1.5 py-0"
                    >
                      +{selectedValues.length - maxCount} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50 absolute right-2 top-[50%] -translate-y-[50%]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width]"
          align="start"
          sideOffset={4}
        >
          <Command className="flex flex-col h-[300px]">
            <CommandInput placeholder="Search..." className="flex-none" />
            <CommandList className="flex-grow overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading products...
                </div>
              ) : options.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleToggleAll}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        options.every(
                          (option) => option.isSelectedForProductBenefit
                        )
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
                          option.isSelectedForProductBenefit
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
              )}
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
