using Microsoft.EntityFrameworkCore;
using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public class ResumeRepository : IResumeRepository
    {
        private readonly ApplicationDbContext _context;

        public ResumeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Resume?> GetResumeByCandidateIdAsync(Guid candidateId)
        {
            return await _context.Resumes
                .Where(r => r.CandidateId == candidateId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<Resume> CreateResumeAsync(Resume resume)
        {
            _context.Resumes.Add(resume);
            await _context.SaveChangesAsync();
            return resume;
        }
    }
}

