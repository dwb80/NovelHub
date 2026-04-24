-- AlterTable
ALTER TABLE "alerts" ALTER COLUMN "severity" DROP DEFAULT,
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "character_profiles" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "creation_insights" ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "severity" DROP DEFAULT,
ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "domain_events" ALTER COLUMN "event_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "operation_logs" ALTER COLUMN "operator_id" DROP DEFAULT,
ALTER COLUMN "operator_type" DROP DEFAULT,
ALTER COLUMN "target_id" DROP DEFAULT,
ALTER COLUMN "target_type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment_orders" ALTER COLUMN "order_no" DROP DEFAULT;

-- AlterTable
ALTER TABLE "plot_patterns" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "readers" ALTER COLUMN "password" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "overall_score" DROP DEFAULT;
