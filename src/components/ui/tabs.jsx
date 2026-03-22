import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.PropsWithoutRef<import("@radix-ui/react-tabs").TabsListProps & { className?: string }> &
 *   React.RefAttributes<HTMLDivElement>
 * >}
 */
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex w-full items-center justify-center rounded-xl p-1 gap-1",
      className
    )}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.PropsWithoutRef<import("@radix-ui/react-tabs").TabsTriggerProps & { className?: string; style?: React.CSSProperties }> &
 *   React.RefAttributes<HTMLButtonElement>
 * >}
 */
const TabsTrigger = React.forwardRef(({ className, style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // base
      "flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg",
      "px-3 py-2 text-xs sm:text-sm font-semibold tracking-wide",
      "transition-all duration-200 outline-none select-none",
      "disabled:pointer-events-none disabled:opacity-40",
      // inactive
      "text-zinc-500 border border-transparent hover:text-zinc-300",
      // active — overrides via data attribute
      "data-[state=active]:text-emerald-400",
      className
    )}
    style={{
      // active pill styles applied via inline so they beat shadcn specificity
      ...style,
    }}
    onMouseEnter={e => {
      if (e.currentTarget.dataset.state !== 'active') {
        e.currentTarget.style.color = '#a1a1aa';
      }
    }}
    onMouseLeave={e => {
      if (e.currentTarget.dataset.state !== 'active') {
        e.currentTarget.style.color = '';
      }
    }}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Wrap trigger to inject active styles after mount
/**
 * @type {React.ForwardRefExoticComponent<
 *   React.PropsWithoutRef<import("@radix-ui/react-tabs").TabsTriggerProps & { className?: string; style?: React.CSSProperties }> &
 *   React.RefAttributes<HTMLButtonElement>
 * >}
 */
const StyledTabsTrigger = React.forwardRef((props, ref) => {
  const innerRef = React.useRef(null);

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      const isActive = el.dataset.state === 'active';
      if (isActive) {
        el.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(45,212,191,0.10))';
        el.style.border = '1px solid rgba(52,211,153,0.35)';
        el.style.boxShadow = '0 0 14px rgba(52,211,153,0.10)';
        el.style.color = '#34d399';
      } else {
        el.style.background = 'transparent';
        el.style.border = '1px solid transparent';
        el.style.boxShadow = 'none';
        el.style.color = '';
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });

    // apply immediately on mount
    if (el.dataset.state === 'active') {
      el.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(45,212,191,0.10))';
      el.style.border = '1px solid rgba(52,211,153,0.35)';
      el.style.boxShadow = '0 0 14px rgba(52,211,153,0.10)';
      el.style.color = '#34d399';
    }

    return () => observer.disconnect();
  }, []);

  return (
    <TabsTrigger
      ref={el => {
        innerRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      {...props}
    />
  );
});
StyledTabsTrigger.displayName = 'StyledTabsTrigger';

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.PropsWithoutRef<import("@radix-ui/react-tabs").TabsContentProps & { className?: string }> &
 *   React.RefAttributes<HTMLDivElement>
 * >}
 */
const TabsContent = React.forwardRef(function TabsContent({ className, value, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      value={value}
      className={cn(
        "mt-2 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, StyledTabsTrigger as TabsTrigger, TabsContent }