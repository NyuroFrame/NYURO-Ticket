from pydantic import BaseModel
from enum import Enum


class TicketPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class TicketSummaryRequest(BaseModel):
    ticket_id: str
    title: str
    description: str
    priority: TicketPriority


class TicketSummaryResponse(BaseModel):
    ticket_id: str
    summary: str
    suggested_priority: TicketPriority
