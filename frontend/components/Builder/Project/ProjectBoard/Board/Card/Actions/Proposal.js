import { useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import ReactHtmlParser from "react-html-parser";

import { UPDATE_PROJECT_BOARD } from "../../../../../../Mutations/Proposal";
import { PROPOSAL_QUERY } from "../../../../../../Queries/Proposal";
import { PROPOSAL_REVIEWS_QUERY } from "../../../../../../Queries/Proposal";

import Navigation from "./Navigation";
import Comment from "./Comment";

import {
  StyledReviewPage,
  StyledReviewSection,
  StyledReviewBoard,
  StyledReviewCard,
} from "../../../../../../styles/StyledReview";

export default function Proposal({
  query,
  tab,
  user,
  proposalId,
  proposal,
  cardId,
  proposalCard,
}) {
  // find the current section for preview
  const currentSections = proposal?.sections.filter((section) =>
    section?.cards.map((card) => card?.id).includes(proposalCard?.id)
  );
  let currentSection;
  if (currentSections && currentSections.length) {
    currentSection = currentSections[0];
  }

  const previewCards = currentSection?.cards.filter(
    (card) =>
      card?.settings?.includeInReport && card?.settings?.status === "Completed"
  );

  const { data } = useQuery(PROPOSAL_REVIEWS_QUERY, {
    variables: {
      id: proposal?.id,
    },
  });

  const project = data?.proposalBoard || { sections: [] };

  const [updateProposal, { loading }] = useMutation(UPDATE_PROJECT_BOARD, {
    refetchQueries: [
      {
        query: PROPOSAL_QUERY,
        variables: { id: proposal?.id },
      },
    ],
  });

  const submitProposal = async () => {
    const res = await updateProposal({
      variables: {
        id: proposal?.id,
        input: {
          submitProposalStatus: "SUBMITTED",
          submitProposalOpenForComments: true,
        },
      },
    });
    if (res?.data?.updateProposalBoard?.id) {
      alert("The proposal was submitted for review");
    }
  };

  return (
    <StyledReviewPage>
      <Navigation
        query={query}
        user={user}
        tab={tab}
        toggleSidebar={() => {}}
        proposalId={proposalId}
        cardId={cardId}
        saveBtnFunction={() => {
          submitProposal();
        }}
        saveBtnName="Close"
      />
      <StyledReviewBoard>
        <StyledReviewSection>
          <div>
            <h2>Project Proposal</h2>
            <p>This is how your proposal will appear in the Feedback Center</p>
            <div>
              {previewCards.map((card) => (
                <div>
                  <h3>{card?.title}</h3>
                  <h4>{ReactHtmlParser(card?.content)}</h4>
                </div>
              ))}
            </div>
          </div>
          <div>
            <StyledReviewCard className="submit">
              <h2>Ready to receive feedback on your proposal?</h2>
              <p>
                Once you submit your proposal for review, your proposal will
                become available to peer reviews from other participating
                schools to view and review.
              </p>
              <p>
                {proposal?.submitProposalStatus === "SUBMITTED" && (
                  <strong>
                    You have already submitted your proposal for review.
                  </strong>
                )}
              </p>
              <div className="buttons">
                {proposal?.submitProposalStatus === "SUBMITTED" && (
                  <Link href={`/dashboard/review`}>
                    <div className="submitBtn view">
                      <img src="/assets/icons/review/brain-and-head-green.svg" />
                      <div>View submission</div>
                    </div>
                  </Link>
                )}

                {proposal?.submitProposalStatus !== "SUBMITTED" && (
                  <div
                    className="submitBtn active"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to submit this proposal? You will not be able to undo it later."
                        )
                      ) {
                        submitProposal();
                      }
                    }}
                  >
                    <img src="/assets/icons/review/brain-and-head.svg" />
                    <div>Submit Proposal</div>
                  </div>
                )}
              </div>
            </StyledReviewCard>

            <StyledReviewCard className="reviews">
              <h2>Feedback</h2>
              <p>
                Once you submit your proposal or study, your reviews will appear
                here.
              </p>

              <div>
                {project?.reviews &&
                project?.reviews.filter(
                  (review) => review.stage === "SUBMITTED_AS_PROPOSAL"
                ).length ? (
                  <div className="reviewsCards">
                    {project?.reviews
                      .filter(
                        (review) => review.stage === "SUBMITTED_AS_PROPOSAL"
                      )
                      .sort((a, b) => {
                        return b?.upvotedBy?.length - a?.upvotedBy?.length;
                      })
                      .map((review, num) => (
                        <Comment key={num} number={num + 1} review={review} />
                      ))}
                  </div>
                ) : (
                  <div className="reviewsPlaceholder">
                    <p>
                      <strong>You don’t have any reviews yet</strong>
                    </p>
                    <p>Reviews will appear here once you submit</p>
                  </div>
                )}
              </div>
            </StyledReviewCard>
          </div>
        </StyledReviewSection>
      </StyledReviewBoard>
    </StyledReviewPage>
  );
}
