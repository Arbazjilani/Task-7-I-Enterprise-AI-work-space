from app.database import Base, engine

# Import all models
from app.models.user import User
from app.models.role import Role
from app.models.employee import Employee
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.document_version import DocumentVersion
from app.models.citation import Citation
from app.models.api_usage import APIUsage
from app.models.usage_log import UsageLog
from app.models.mcp_execution import MCPExecution

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("✅ All database tables created successfully!")