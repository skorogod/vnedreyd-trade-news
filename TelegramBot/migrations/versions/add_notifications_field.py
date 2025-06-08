"""add notifications field

Revision ID: add_notifications_field
Revises: 
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_notifications_field'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем колонку notifications с типом boolean и значением по умолчанию true
    op.execute('ALTER TABLE public.users ADD COLUMN notifications boolean NOT NULL DEFAULT true')


def downgrade():
    # Удаляем колонку notifications
    op.execute('ALTER TABLE public.users DROP COLUMN notifications') 