using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IResumeRepository
    {
        Task<Resume?> GetResumeByCandidateIdAsync(Guid candidateId);
        Task<Resume> CreateResumeAsync(Resume resume);
    }
}

