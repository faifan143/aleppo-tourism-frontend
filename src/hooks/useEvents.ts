import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/utils/axios";
import { toast } from "react-hot-toast";

// Define query keys as constants for consistent usage
export const EVENT_QUERY_KEYS = {
    ALL_EVENTS: ['events'],
    EVENTS_BY_PLACE: (placeId: number) => ['events', 'place', placeId],
    UPCOMING_EVENTS: ['events', 'upcoming'],
    EVENT_DETAILS: (id: number) => ['event', id],
};

export interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    image: string;
    tourismPlaceId: number;
    createdAt: string;
    updatedAt: string;
    tourismPlace?: {
        id: number;
        name: string;
    };
}

/**
 * Hook to fetch all events
 */
export function useEvents() {
    return useQuery<Event[]>({
        queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
        queryFn: async () => {
            const events = await eventsApi.getAll();
            return events;
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch events by tourism place ID
 */
export function useEventsByPlaceId(placeId: number) {
    return useQuery<Event[]>({
        queryKey: EVENT_QUERY_KEYS.EVENTS_BY_PLACE(placeId),
        queryFn: async () => {
            const events = await eventsApi.getByPlaceId(placeId);
            return events;
        },
        enabled: !!placeId,
        staleTime: 0,
        refetchOnMount: true,
    });
}

/**
 * Hook to fetch upcoming events
 */
export function useUpcomingEvents() {
    return useQuery<Event[]>({
        queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
        queryFn: async () => {
            const events = await eventsApi.getUpcoming();
            return events;
        },
        staleTime: 0,
        refetchOnMount: true,
    });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: number) {
    return useQuery<Event>({
        queryKey: EVENT_QUERY_KEYS.EVENT_DETAILS(id),
        queryFn: async () => {
            const event = await eventsApi.getById(id);
            return event;
        },
        enabled: !!id,
        staleTime: 0,
        refetchOnMount: true,
    });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => eventsApi.create(formData),
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: EVENT_QUERY_KEYS.ALL_EVENTS });

            // Show loading toast
            toast.loading("جاري إضافة الفعالية...", { id: "create-event" });

            // Return context with current events
            return { previousEvents: queryClient.getQueryData(EVENT_QUERY_KEYS.ALL_EVENTS) };
        },
        onSuccess: (_data, variables) => {
            // Extract tourismPlaceId if it exists in the form data
            const tourismPlaceId = variables.get('tourismPlaceId') as string;

            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });

            // If creating for a specific place, invalidate that place's events too
            if (tourismPlaceId) {
                queryClient.invalidateQueries({
                    queryKey: EVENT_QUERY_KEYS.EVENTS_BY_PLACE(Number(tourismPlaceId)),
                    refetchType: 'all'
                });
            }

            // Always invalidate upcoming events
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });

            // Success notification
            toast.success("تم إضافة الفعالية بنجاح", { id: "create-event" });
        },
        onError: (error) => {
            console.error("Error creating event:", error);
            toast.error("حدث خطأ أثناء إضافة الفعالية", { id: "create-event" });
        },
        onSettled: () => {
            // Always refetch all events to ensure data consistency
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });
        }
    });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { id: number; formData: FormData }) =>
            eventsApi.update(data.id, data.formData),
        onMutate: async (data) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: EVENT_QUERY_KEYS.ALL_EVENTS });
            await queryClient.cancelQueries({ queryKey: EVENT_QUERY_KEYS.EVENT_DETAILS(data.id) });

            // Show loading toast
            toast.loading("جاري تحديث الفعالية...", { id: "update-event" });

            // Return context with current events
            return {
                previousEvents: queryClient.getQueryData(EVENT_QUERY_KEYS.ALL_EVENTS),
                previousEvent: queryClient.getQueryData(EVENT_QUERY_KEYS.EVENT_DETAILS(data.id))
            };
        },
        onSuccess: (_data, variables) => {
            // Extract tourismPlaceId if it exists in the form data
            const tourismPlaceId = variables.formData.get('tourismPlaceId') as string;

            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.EVENT_DETAILS(variables.id),
                refetchType: 'all'
            });

            // If updating for a specific place, invalidate that place's events too
            if (tourismPlaceId) {
                queryClient.invalidateQueries({
                    queryKey: EVENT_QUERY_KEYS.EVENTS_BY_PLACE(Number(tourismPlaceId)),
                    refetchType: 'all'
                });
            }

            // Always invalidate upcoming events
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });

            // Success notification
            toast.success("تم تحديث الفعالية بنجاح", { id: "update-event" });
        },
        onError: (error) => {
            console.error("Error updating event:", error);
            toast.error("حدث خطأ أثناء تحديث الفعالية", { id: "update-event" });
        },
        onSettled: (_data, _error, variables) => {
            // Always refetch to ensure data consistency
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.EVENT_DETAILS(variables.id),
                refetchType: 'all'
            });
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });
        }
    });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => eventsApi.delete(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: EVENT_QUERY_KEYS.ALL_EVENTS });

            // Show loading toast
            toast.loading("جاري حذف الفعالية...", { id: "delete-event" });

            // Get current events from cache
            const previousEvents = queryClient.getQueryData<Event[]>(EVENT_QUERY_KEYS.ALL_EVENTS);

            // Optimistically update the cache to remove the deleted event
            if (previousEvents) {
                const updatedEvents = previousEvents.filter(event => event.id !== id);
                queryClient.setQueryData(EVENT_QUERY_KEYS.ALL_EVENTS, updatedEvents);
            }

            // Return context with current events
            return { previousEvents };
        },
        onSuccess: (_data, id) => {
            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });

            // Remove deleted event from cache
            queryClient.removeQueries({ queryKey: EVENT_QUERY_KEYS.EVENT_DETAILS(id) });

            // Always invalidate upcoming events
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });

            // Success notification
            toast.success("تم حذف الفعالية بنجاح", { id: "delete-event" });
        },
        onError: (error, _id, context) => {
            console.error("Error deleting event:", error);

            // Restore previous data on error
            if (context?.previousEvents) {
                queryClient.setQueryData(EVENT_QUERY_KEYS.ALL_EVENTS, context.previousEvents);
            }

            toast.error("حدث خطأ أثناء حذف الفعالية", { id: "delete-event" });
        },
        onSettled: () => {
            // Always refetch all events to ensure data consistency
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.ALL_EVENTS,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({
                queryKey: EVENT_QUERY_KEYS.UPCOMING_EVENTS,
                refetchType: 'all'
            });
        }
    });
} 