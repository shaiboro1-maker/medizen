import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { limit = 5, skip = 0 } = body;

    const exercises = await base44.asServiceRole.entities.Exercise.list('-created_date', 100);
    const batch = exercises.slice(skip, skip + limit);

    const results = [];
    for (const exercise of batch) {
      const prompt = `Professional medical/fitness photography: ${exercise.data.title} - ${exercise.data.description}. 
        Category: ${exercise.data.category}. 
        Clean white background, realistic, high quality, showing proper exercise form, 
        healthcare and wellness style, no text.`;

      const { url } = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });

      const imageField = exercise.data.thumbnail_url !== undefined ? 'thumbnail_url' : 'image_url';
      await base44.asServiceRole.entities.Exercise.update(exercise.id, { [imageField]: url });

      results.push({ id: exercise.id, title: exercise.data.title, image_url: url });
    }

    return Response.json({ success: true, updated: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});