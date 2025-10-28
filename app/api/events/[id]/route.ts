import { NextResponse, NextRequest } from "next/server";
import { authenticatedBackendFetch } from "../../_utils/auth";

// GET /api/events/[id] - Get specific event details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    // Fetch from Django backend
    const response = await authenticatedBackendFetch(`/events/${eventId}/`, {
      method: 'GET',
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to fetch event' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform backend event to frontend format
    const transformEvent = (backendEvent: any) => ({
      id: backendEvent.id,
      eventCode: backendEvent.event_code || backendEvent.code,
      eventName: backendEvent.name,
      startDate: backendEvent.starts_at,
      endDate: backendEvent.ends_at,
      maxParticipants: backendEvent.max_participants,
      registrationStatus: backendEvent.registration_status,
      selectedChallenges: backendEvent.challenge_ids || backendEvent.challenges || [],
      eventChallenges: backendEvent.event_challenges || [],
      description: backendEvent.description || '',
      createdAt: backendEvent.created_at,
      updatedAt: backendEvent.updated_at,
      isActive: backendEvent.is_active,
      isUpcoming: backendEvent.is_upcoming,
      isPast: backendEvent.is_past,
      totalChallenges: backendEvent.total_challenges,
      publishedChallenges: backendEvent.published_challenges,
      createdBy: backendEvent.created_by,
      createdByName: backendEvent.created_by_name,
    });
    
    // Try to fetch participants for this event
    try {
      const participantsResponse = await authenticatedBackendFetch(`/events/${eventId}/participants/`, {
        method: 'GET',
      }, req);
      
      let participants = [];
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        participants = participantsData.results || participantsData || [];
      }
      
      return NextResponse.json({
        event: transformEvent(data),
        participants: participants,
        stats: {
          totalParticipants: participants.length,
          confirmedParticipants: participants.filter((p: any) => p.status === "Confirmed").length,
          pendingParticipants: participants.filter((p: any) => p.status === "Pending").length
        }
      });
    } catch (error) {
      // Return event without participants if fetch fails
      return NextResponse.json({
        event: transformEvent(data),
        participants: [],
        stats: {
          totalParticipants: 0,
          confirmedParticipants: 0,
          pendingParticipants: 0
        }
      });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event details
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const data = await req.json();

    console.log('PUT /api/events/[id] - Event ID:', eventId);
    console.log('PUT /api/events/[id] - Request data:', data);

    // Transform frontend field names to Django backend field names
    const backendPayload = {
      name: data.eventName || data.name,
      event_code: data.eventCode || data.event_code || data.code,
      starts_at: data.startDate || data.starts_at,
      ends_at: data.endDate || data.ends_at,
      max_participants: data.maxParticipants || data.max_participants,
      registration_status: data.registrationStatus || data.registration_status,
      challenges: data.selectedChallenges || data.challenges || [],
      description: data.description || '',
    };

    console.log('Backend payload:', backendPayload);

    // Update event in Django backend
    const response = await authenticatedBackendFetch(`/events/${eventId}/`, {
      method: 'PUT',
      body: JSON.stringify(backendPayload),
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      return NextResponse.json(
        errorData || { error: 'Failed to update event' },
        { status: response.status }
      );
    }

    const backendEvent = await response.json();
    
    // Transform backend response to frontend format
    const frontendEvent = {
      id: backendEvent.id,
      eventCode: backendEvent.event_code || backendEvent.code,
      eventName: backendEvent.name,
      startDate: backendEvent.starts_at,
      endDate: backendEvent.ends_at,
      maxParticipants: backendEvent.max_participants,
      registrationStatus: backendEvent.registration_status,
      selectedChallenges: backendEvent.challenge_ids || backendEvent.challenges || [],
      eventChallenges: backendEvent.event_challenges || [],
      description: backendEvent.description || '',
      createdAt: backendEvent.created_at,
      updatedAt: backendEvent.updated_at,
      isActive: backendEvent.is_active,
      isUpcoming: backendEvent.is_upcoming,
      isPast: backendEvent.is_past,
      totalChallenges: backendEvent.total_challenges,
      publishedChallenges: backendEvent.published_challenges,
      createdBy: backendEvent.created_by,
      createdByName: backendEvent.created_by_name,
    };
    
    console.log('Event updated successfully:', frontendEvent);
    
    return NextResponse.json({
      message: "Event updated successfully",
      event: frontendEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Delete event from Django backend
    const response = await authenticatedBackendFetch(`/events/${eventId}/`, {
      method: 'DELETE',
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to delete event' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

