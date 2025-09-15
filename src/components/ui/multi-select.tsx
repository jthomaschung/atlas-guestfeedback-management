import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter(s => s !== item))
  }

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(s => s !== item))
    } else {
      onChange([...selected, item])
    }
    // Don't close the popover after selection
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.slice(0, 2).map((item) => {
                const option = options.find(o => o.value === item)
                return (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(item)
                    }}
                  >
                    {option?.label}
                    <X className="h-3 w-3 ml-1 cursor-pointer hover:text-foreground" />
                  </Badge>
                )
              })}
              {selected.length > 2 && (
                <Badge variant="secondary" className="mr-1 mb-1">
                  +{selected.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-background border border-border z-50" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {}}
                >
                  <div 
                    className="flex items-center space-x-2 cursor-pointer w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 border border-primary rounded-sm flex items-center justify-center",
                        selected.includes(option.value) ? "bg-primary text-primary-foreground" : "bg-background"
                      )}
                    >
                      {selected.includes(option.value) && (
                        <div className="h-2 w-2 bg-current rounded-sm" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}