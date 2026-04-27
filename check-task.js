const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    const review = await prisma.review.findFirst({
      include: {
        task: true,
        chapter: {
          include: {
            novel: true
          }
        },
        reviewer: true
      }
    });
    
    if (review) {
      console.log('Review ID:', review.id);
      console.log('Task ID:', review.taskId);
      console.log('Task assignedAt:', review.task?.assignedAt);
      console.log('Task completedAt:', review.task?.completedAt);
      console.log('Task status:', review.task?.status);
      console.log('Novel:', review.chapter?.novel?.title);
      console.log('Chapter:', review.chapter?.title);
      console.log('Reviewer:', review.reviewer?.displayName);
    } else {
      console.log('No review found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
