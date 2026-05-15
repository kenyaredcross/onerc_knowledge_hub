import { useState, useEffect } from "react";
import { useFrappeGetCall, useFrappePostCall, useFrappeAuth } from "frappe-react-sdk";
import { MessageCircle, Send, User } from "lucide-react";
import toast from "react-hot-toast";

interface Comment {
  name: string;
  owner: string;
  creation: string;
  content: string;
  comment_email: string;
  comment_by: string;
}

interface CommentsProps {
  doctype: string;
  docname: string;
}

export default function Comments({ doctype, docname }: CommentsProps) {
  const { currentUser } = useFrappeAuth();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments using frappe.client.get_list
  const { data: commentsData, isLoading, mutate } = useFrappeGetCall<{ message: Comment[] }>(
    "frappe.client.get_list",
    {
      doctype: "Comment",
      filters: [
        ["reference_doctype", "=", doctype],
        ["reference_name", "=", docname],
        ["comment_type", "=", "Comment"]
      ],
      fields: ["name", "owner", "creation", "content", "comment_email", "comment_by"],
      order_by: "creation desc",
      limit_page_length: 100
    },
    docname ? undefined : null
  );

  // Post comment
  const { call: postComment } = useFrappePostCall("frappe.desk.form.utils.add_comment");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting || !currentUser) return;

    setIsSubmitting(true);
    try {
      await postComment({
        reference_doctype: doctype,
        reference_name: docname,
        content: comment,
        comment_email: currentUser,
        comment_by: currentUser,
      });

      setComment("");
      mutate(); // Refresh comments
      toast.success("Comment posted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const comments = commentsData?.message?.filter(
    (c) => c.content
  ) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-dash-navy" />
        <h3 className="font-bold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-dash-navy flex items-center justify-center text-white font-bold shrink-0">
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dash-red focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded text-center">
          <p className="text-sm text-gray-600">Please log in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.name} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">
                    {c.comment_by || c.owner}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(c.creation)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {stripHtml(c.content)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
