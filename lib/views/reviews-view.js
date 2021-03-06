import path from 'path';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {CompositeDisposable} from 'event-kit';

import {EnableableOperationPropType} from '../prop-types';
import Tooltip from '../atom/tooltip';
import Commands, {Command} from '../atom/commands';
import AtomTextEditor from '../atom/atom-text-editor';
import {getDataFromGithubUrl} from './issueish-link';
import EmojiReactionsController from '../controllers/emoji-reactions-controller';
import {checkoutStates} from '../controllers/pr-checkout-controller';
import GithubDotcomMarkdown from './github-dotcom-markdown';
import PatchPreviewView from './patch-preview-view';
import CheckoutButton from './checkout-button';
import Timeago from './timeago';
import Octicon from '../atom/octicon';
import RefHolder from '../models/ref-holder';
import {toNativePathSep} from '../helpers';
import {addEvent} from '../reporter-proxy';

export default class ReviewsView extends React.Component {
  static propTypes = {
    // Relay results
    relay: PropTypes.shape({
      environment: PropTypes.object.isRequired,
    }).isRequired,
    repository: PropTypes.object.isRequired,
    pullRequest: PropTypes.object.isRequired,
    summaries: PropTypes.array.isRequired,
    commentThreads: PropTypes.arrayOf(PropTypes.shape({
      thread: PropTypes.object.isRequired,
      comments: PropTypes.arrayOf(PropTypes.object).isRequired,
    })),
    refetch: PropTypes.func.isRequired,

    // Package models
    multiFilePatch: PropTypes.object.isRequired,
    contextLines: PropTypes.number.isRequired,
    checkoutOp: EnableableOperationPropType.isRequired,
    summarySectionOpen: PropTypes.bool.isRequired,
    commentSectionOpen: PropTypes.bool.isRequired,
    threadIDsOpen: PropTypes.shape({
      has: PropTypes.func.isRequired,
    }),
    postingToThreadID: PropTypes.string,
    scrollToThreadID: PropTypes.string,
    // Structure: Map< relativePath: String, {
    //   rawPositions: Set<lineNumbers: Number>,
    //   diffToFilePosition: Map<rawPosition: Number, adjustedPosition: Number>,
    //   fileTranslations: null | Map<adjustedPosition: Number, {newPosition: Number}>,
    //   digest: String,
    // }>
    commentTranslations: PropTypes.object,

    // for the dotcom link in the empty state
    number: PropTypes.number.isRequired,
    repo: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    workdir: PropTypes.string.isRequired,

    // Atom environment
    workspace: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    commands: PropTypes.object.isRequired,
    tooltips: PropTypes.object.isRequired,

    // Action methods
    openFile: PropTypes.func.isRequired,
    openDiff: PropTypes.func.isRequired,
    openPR: PropTypes.func.isRequired,
    moreContext: PropTypes.func.isRequired,
    lessContext: PropTypes.func.isRequired,
    openIssueish: PropTypes.func.isRequired,
    showSummaries: PropTypes.func.isRequired,
    hideSummaries: PropTypes.func.isRequired,
    showComments: PropTypes.func.isRequired,
    hideComments: PropTypes.func.isRequired,
    showThreadID: PropTypes.func.isRequired,
    hideThreadID: PropTypes.func.isRequired,
    resolveThread: PropTypes.func.isRequired,
    unresolveThread: PropTypes.func.isRequired,
    addSingleComment: PropTypes.func.isRequired,
    reportMutationErrors: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.rootHolder = new RefHolder();
    this.replyHolders = new Map();
    this.threadHolders = new Map();
    this.state = {
      isRefreshing: false,
    };
    this.subs = new CompositeDisposable();
  }

  componentDidMount() {
    const {scrollToThreadID} = this.props;
    if (scrollToThreadID) {
      const threadHolder = this.threadHolders.get(scrollToThreadID);
      if (threadHolder) {
        threadHolder.map(element => {
          element.scrollIntoViewIfNeeded();
          return null; // shh, eslint
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {scrollToThreadID} = this.props;
    if (scrollToThreadID && scrollToThreadID !== prevProps.scrollToThreadID) {
      const threadHolder = this.threadHolders.get(scrollToThreadID);
      if (threadHolder) {
        threadHolder.map(element => {
          element.scrollIntoViewIfNeeded();
          return null; // shh, eslint
        });
      }
    }
  }

  componentWillUnmount() {
    this.subs.dispose();
  }

  render() {
    return (
      <div className="github-Reviews" ref={this.rootHolder.setter}>
        {this.renderCommands()}
        {this.renderHeader()}
        <div className="github-Reviews-list">
          {this.renderReviewSummaries()}
          {this.renderReviewCommentThreads()}
        </div>
      </div>
    );
  }

  renderCommands() {
    return (
      <Fragment>
        <Commands registry={this.props.commands} target={this.rootHolder}>
          <Command command="github:more-context" callback={this.props.moreContext} />
          <Command command="github:less-context" callback={this.props.lessContext} />
        </Commands>
        <Commands registry={this.props.commands} target=".github-Review-reply">
          <Command command="github:submit-comment" callback={this.submitCurrentComment} />
        </Commands>
      </Fragment>
    );
  }

  renderHeader() {
    const refresh = () => {
      if (this.state.isRefreshing) {
        return;
      }
      this.setState({isRefreshing: true});
      const sub = this.props.refetch(() => {
        this.subs.remove(sub);
        this.setState({isRefreshing: false});
      });
      this.subs.add(sub);
    };
    return (
      <header className="github-Reviews-topHeader">
        <span className="icon icon-comment-discussion" />
        <span className="github-Reviews-headerTitle">
          Reviews for&nbsp;
          <span className="github-Reviews-clickable" onClick={this.props.openPR}>
            {this.props.owner}/{this.props.repo}#{this.props.number}
          </span>
        </span>
        <button
          className={cx(
            'github-Reviews-headerButton github-Reviews-clickable icon icon-repo-sync',
            {refreshing: this.state.isRefreshing},
          )}
          onClick={refresh}
        />
        <CheckoutButton
          checkoutOp={this.props.checkoutOp}
          classNamePrefix="github-Reviews-checkoutButton--"
          classNames={['github-Reviews-headerButton']}
        />
      </header>
    );
  }

  logStartReviewClick = () => {
    addEvent('start-pr-review', {package: 'github', component: this.constructor.name});
  }

  renderEmptyState() {
    const {number, repo, owner} = this.props;
    // todo: make this open the review flow in Atom instead of dotcom
    const pullRequestURL = `https://www.github.com/${owner}/${repo}/pull/${number}/files/`;
    return (
      <div className="github-Reviews-emptyState">
        <img src="atom://github/img/mona.svg" alt="Mona the octocat in spaaaccee" className="github-Reviews-emptyImg" />
        <div className="github-Reviews-emptyText">
          This pull request has no reviews
        </div>
        <button className="github-Reviews-emptyCallToActionButton btn">
          <a href={pullRequestURL} onClick={this.logStartReviewClick}>
            Start a new review
          </a>
        </button>
      </div>
    );
  }

  renderReviewSummaries() {
    if (this.props.summaries.length === 0) {
      return this.renderEmptyState();
    }

    const toggle = evt => {
      evt.preventDefault();
      if (this.props.summarySectionOpen) {
        this.props.hideSummaries();
      } else {
        this.props.showSummaries();
      }
    };

    return (
      <details
        className="github-Reviews-section summaries"
        open={this.props.summarySectionOpen}>

        <summary className="github-Reviews-header" onClick={toggle}>
          <span className="github-Reviews-title">Summaries</span>
        </summary>
        <main className="github-Reviews-container">
          {this.props.summaries.map(this.renderReviewSummary)}
        </main>

      </details>
    );
  }

  renderReviewSummary = review => {
    const reviewTypes = type => {
      return {
        APPROVED: {icon: 'icon-check', copy: 'approved these changes'},
        COMMENTED: {icon: 'icon-comment', copy: 'commented'},
        CHANGES_REQUESTED: {icon: 'icon-alert', copy: 'requested changes'},
      }[type] || {icon: '', copy: ''};
    };

    const {icon, copy} = reviewTypes(review.state);

    // filter non actionable empty summary comments from this view
    if (review.state === 'PENDING' || (review.state === 'COMMENTED' && review.bodyHTML === '')) {
      return null;
    }

    const reviewAuthor = review.author ? review.author.login : '';
    return (
      <div className="github-ReviewSummary" key={review.id}>
        <header className="github-ReviewSummary-header">
          <span className={`github-ReviewSummary-icon icon ${icon}`} />
          <img className="github-ReviewSummary-avatar"
            src={review.author ? review.author.avatarUrl : ''} alt={reviewAuthor}
          />
          <a className="github-ReviewSummary-username" href={`https://github.com/${reviewAuthor}`}>{reviewAuthor}</a>
          <span className="github-ReviewSummary-type">{copy}</span>
          <Timeago className="github-ReviewSummary-timeAgo" time={review.submittedAt} displayStyle="short" />
        </header>
        <main className="github-ReviewSummary-comment">
          <GithubDotcomMarkdown
            html={review.bodyHTML}
            switchToIssueish={this.props.openIssueish}
            openIssueishLinkInNewTab={this.openIssueishLinkInNewTab}
          />
          <EmojiReactionsController
            reactable={review}
            tooltips={this.props.tooltips}
            reportMutationErrors={this.props.reportMutationErrors}
          />
        </main>
      </div>
    );
  }

  renderReviewCommentThreads() {
    const commentThreads = this.props.commentThreads;
    if (commentThreads.length === 0) {
      return null;
    }

    const resolvedThreads = commentThreads.filter(pair => pair.thread.isResolved).length;

    const toggleComments = evt => {
      evt.preventDefault();
      if (this.props.commentSectionOpen) {
        this.props.hideComments();
      } else {
        this.props.showComments();
      }
    };

    return (
      <details
        className="github-Reviews-section comments"
        open={this.props.commentSectionOpen}>

        <summary className="github-Reviews-header" onClick={toggleComments}>
          <span className="github-Reviews-title">Comments</span>
          <span className="github-Reviews-progress">
            <span className="github-Reviews-count">
              Resolved
              {' '}<span className="github-Reviews-countNr">{resolvedThreads}</span>{' '}
              of
              {' '}<span className="github-Reviews-countNr">{commentThreads.length}</span>
            </span>
            <progress className="github-Reviews-progessBar" value={resolvedThreads} max={commentThreads.length} />
          </span>
        </summary>
        <main className="github-Reviews-container">
          {commentThreads.map(this.renderReviewCommentThread)}
        </main>

      </details>
    );
  }

  renderReviewCommentThread = commentThread => {
    const {comments, thread} = commentThread;
    const rootComment = comments[0];
    if (!rootComment) {
      return null;
    }

    let threadHolder = this.threadHolders.get(thread.id);
    if (!threadHolder) {
      threadHolder = new RefHolder();
      this.threadHolders.set(thread.id, threadHolder);
    }

    const nativePath = toNativePathSep(rootComment.path);
    const {dir, base} = path.parse(nativePath);
    const {lineNumber, positionText} = this.getTranslatedPosition(rootComment);

    const refJumpToFileButton = new RefHolder();
    const jumpToFileDisabledLabel = 'Checkout this pull request to enable Jump To File.';

    const elementId = `review-thread-${thread.id}`;

    const navButtonClasses = ['github-Review-navButton', 'icon', {outdated: !lineNumber}];
    const openFileClasses = cx('icon-code', ...navButtonClasses);
    const openDiffClasses = cx('icon-diff', ...navButtonClasses);

    const isOpen = this.props.threadIDsOpen.has(thread.id);
    const isHighlighted = this.props.scrollToThreadID === thread.id;
    const toggle = evt => {
      evt.preventDefault();
      evt.stopPropagation();

      if (isOpen) {
        this.props.hideThreadID(thread.id);
      } else {
        this.props.showThreadID(thread.id);
      }
    };

    return (
      <details
        ref={threadHolder.setter}
        className={cx('github-Review', {'resolved': thread.isResolved, 'github-Review--highlight': isHighlighted})}
        key={elementId}
        id={elementId}
        open={isOpen}>

        <summary className="github-Review-reference" onClick={toggle}>
          {dir && <span className="github-Review-path">{dir}</span>}
          <span className="github-Review-file">{dir ? path.sep : ''}{base}</span>
          <span className="github-Review-lineNr">{positionText}</span>
          <img className="github-Review-referenceAvatar"
            src={rootComment.author ? rootComment.author.avatarUrl : ''} alt={rootComment.author.login}
          />
          <Timeago className="github-Review-referenceTimeAgo" time={rootComment.createdAt} displayStyle="short" />
        </summary>
        <nav className="github-Review-nav">
          <button className={openFileClasses}
            data-path={nativePath} data-line={lineNumber}
            onClick={this.openFile} disabled={this.props.checkoutOp.isEnabled()}
            ref={refJumpToFileButton.setter}>
            Jump To File
          </button>
          <button className={openDiffClasses}
            data-path={nativePath} data-line={rootComment.position}
            onClick={this.openDiff}>
            Open Diff
          </button>
          {this.props.checkoutOp.isEnabled() &&
            <Tooltip
              manager={this.props.tooltips}
              target={refJumpToFileButton}
              title={jumpToFileDisabledLabel}
              showDelay={200}
            />
          }
        </nav>

        {rootComment.position !== null && (
          <PatchPreviewView
            multiFilePatch={this.props.multiFilePatch}
            fileName={nativePath}
            diffRow={rootComment.position}
            maxRowCount={this.props.contextLines}
            config={this.props.config}
          />
        )}

        {this.renderThread({thread, comments})}

      </details>
    );
  }

  renderThread = ({thread, comments}) => {
    let replyHolder = this.replyHolders.get(thread.id);
    if (!replyHolder) {
      replyHolder = new RefHolder();
      this.replyHolders.set(thread.id, replyHolder);
    }

    const lastComment = comments[comments.length - 1];
    const isPosting = this.props.postingToThreadID !== null;

    return (
      <Fragment>
        <main className="github-Review-comments">

          {comments.map(this.renderComment)}

          <div
            className={cx('github-Review-reply', {'github-Review-reply--disabled': isPosting})}
            data-thread-id={thread.id}>

            <AtomTextEditor
              placeholderText="Reply..."
              lineNumberGutterVisible={false}
              softWrapped={true}
              autoHeight={true}
              readOnly={isPosting}
              refModel={replyHolder}
            />

          </div>
        </main>
        {thread.isResolved && <div className="github-Review-resolvedText">
          This conversation was marked as resolved by @{thread.resolvedBy.login}
        </div>}
        <footer className="github-Review-footer">
          <button
            className="github-Review-replyButton btn"
            title="Add your comment"
            disabled={isPosting}
            onClick={() => this.submitReply(replyHolder, thread, lastComment)}>
            Comment
          </button>
          {this.renderResolveButton(thread)}
        </footer>
      </Fragment>
    );
  }

  renderResolveButton = thread => {
    if (thread.isResolved) {
      return (
        <button
          className="github-Review-resolveButton btn btn-primary icon icon-check"
          title="Unresolve conversation"
          onClick={() => this.props.unresolveThread(thread)}>
          Unresolve conversation
        </button>
      );
    } else {
      return (
        <button
          className="github-Review-resolveButton btn btn-primary icon icon-check"
          title="Resolve conversation"
          onClick={() => this.props.resolveThread(thread)}>
          Resolve conversation
        </button>
      );
    }
  }

  renderComment = comment => {
    if (comment.isMinimized) {
      return (
        <div className="github-Review-comment github-Review-comment--hidden" key={comment.id}>
          <Octicon icon={'fold'} className="github-Review-icon" />
          <em>This comment was hidden</em>
        </div>
      );
    }

    const commentClass = cx('github-Review-comment', {'github-Review-comment--pending': comment.state === 'PENDING'});
    return (
      <div className={commentClass} key={comment.id}>
        <header className="github-Review-header">
          <div className="github-Review-header-authorData">
            <img className="github-Review-avatar"
              src={comment.author ? comment.author.avatarUrl : ''} alt={comment.author.login}
            />
            <a className="github-Review-username" href={`https://github.com/${comment.author.login}`}>
              {comment.author.login}
            </a>
            <a className="github-Review-timeAgo" href={comment.url}>
              <Timeago displayStyle="long" time={comment.createdAt} />
            </a>
            {comment.state === 'PENDING' && (
              <span className="github-Review-pendingBadge badge badge-warning">pending</span>
            )}
          </div>
          <a className="github-Review-reportAbuseLink" title="report abuse" href="https://github.com/contact/report-content">
            <Octicon icon="alert" />
          </a>
        </header>
        <div className="github-Review-text">
          <GithubDotcomMarkdown
            html={comment.bodyHTML}
            switchToIssueish={this.props.openIssueish}
            openIssueishLinkInNewTab={this.openIssueishLinkInNewTab}
          />
          <EmojiReactionsController
            reactable={comment}
            tooltips={this.props.tooltips}
            reportMutationErrors={this.props.reportMutationErrors}
          />
        </div>
      </div>
    );
  }

  openFile = evt => {
    if (!this.props.checkoutOp.isEnabled()) {
      const target = evt.currentTarget;
      this.props.openFile(target.dataset.path, target.dataset.line);
    }
  }

  openDiff = evt => {
    const target = evt.currentTarget;
    this.props.openDiff(target.dataset.path, parseInt(target.dataset.line, 10));
  }

  openIssueishLinkInNewTab = evt => {
    const {repoOwner, repoName, issueishNumber} = getDataFromGithubUrl(evt.target.dataset.url);
    return this.props.openIssueish(repoOwner, repoName, issueishNumber);
  }

  submitReply(replyHolder, thread, lastComment) {
    const body = replyHolder.map(editor => editor.getText()).getOr('');
    const didSubmitComment = () => replyHolder.map(editor => editor.setText('', {bypassReadOnly: true}));
    const didFailComment = () => replyHolder.map(editor => editor.setText(body, {bypassReadOnly: true}));

    return this.props.addSingleComment(
      body, thread.id, lastComment.id, lastComment.path, lastComment.position, {didSubmitComment, didFailComment},
    );
  }

  submitCurrentComment = evt => {
    const threadID = evt.currentTarget.dataset.threadId;
    /* istanbul ignore if */
    if (!threadID) {
      return null;
    }

    const {thread, comments} = this.props.commentThreads.find(each => each.thread.id === threadID);
    const replyHolder = this.replyHolders.get(threadID);

    return this.submitReply(replyHolder, thread, comments[comments.length - 1]);
  }

  getTranslatedPosition(rootComment) {
    let lineNumber, positionText;
    const translations = this.props.commentTranslations;

    const isCheckedOutPullRequest = this.props.checkoutOp.why() === checkoutStates.CURRENT;
    if (translations === null) {
      lineNumber = null;
      positionText = '';
    } else if (rootComment.position === null) {
      lineNumber = null;
      positionText = 'outdated';
    } else {
      const translationsForFile = translations.get(rootComment.path);
      lineNumber = translationsForFile.diffToFilePosition.get(parseInt(rootComment.position, 10));
      if (translationsForFile.fileTranslations && isCheckedOutPullRequest) {
        lineNumber = translationsForFile.fileTranslations.get(lineNumber).newPosition;
      }
      positionText = lineNumber;
    }

    return {lineNumber, positionText};
  }
}
