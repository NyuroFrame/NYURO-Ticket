from app.models.ticket import TicketSummaryRequest, TicketSummaryResponse, TicketPriority


class AIService:
    async def summarize_ticket(self, request: TicketSummaryRequest) -> TicketSummaryResponse:
        # TODO: integrate with LLM provider (OpenAI, Claude, etc.)
        return TicketSummaryResponse(
            ticket_id=request.ticket_id,
            summary=f"Summary for: {request.title}",
            suggested_priority=request.priority,
        )
